import {
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';
import { getNetworkConfig } from '../stellar/network.js';
import logger from '../utils/logger.js';

type SorobanNativeArg = string | number | bigint | boolean | null;
type SorobanArg = SorobanNativeArg | xdr.ScVal;

const DEFAULT_RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const DEFAULT_TIMEOUT_SECONDS = 60;
const POLL_INTERVAL_MS = 1_500;
const MAX_POLL_ATTEMPTS = 20;

function getRpcServer(): rpc.Server {
  return new rpc.Server(DEFAULT_RPC_URL, { allowHttp: DEFAULT_RPC_URL.startsWith('http://') });
}

function isScVal(value: SorobanArg): value is xdr.ScVal {
  return typeof value === 'object' && value !== null && 'switch' in value;
}

function toScVal(arg: SorobanArg): xdr.ScVal {
  return isScVal(arg) ? arg : nativeToScVal(arg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates a read-only contract call (no signing/submission) and decodes
 * the return value. The account used to build the transaction must exist on
 * the network, but nothing is charged or signed for a pure simulation.
 */
export async function simulateReadOnly<TResult = unknown>(options: {
  contractId: string;
  method: string;
  args?: SorobanArg[];
  sourceAddress: string;
  parseResult?: (value: unknown) => TResult;
}): Promise<TResult | null> {
  const rpcServer = getRpcServer();
  const account = await rpcServer.getAccount(options.sourceAddress);
  const contract = new Contract(options.contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkConfig().networkPassphrase,
  })
    .addOperation(contract.call(options.method, ...(options.args ?? []).map(toScVal)))
    .setTimeout(DEFAULT_TIMEOUT_SECONDS)
    .build();

  const simulation = await rpcServer.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed for ${options.method}: ${simulation.error}`);
  }
  if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result?.retval) {
    return null;
  }

  const raw = scValToNative(simulation.result.retval);
  return options.parseResult ? options.parseResult(raw) : (raw as TResult);
}

/**
 * Simulates, signs (with a raw server-held Keypair — no wallet in the loop),
 * submits, and polls a contract invocation to completion. This is the
 * server-side twin of the frontend's useSorobanContract hook, used by the
 * schedule dispatcher to fire bulk_payment.execute_batch unattended.
 */
export async function invokeWithKeypair<TResult = unknown>(options: {
  contractId: string;
  method: string;
  args?: SorobanArg[];
  sourceKeypair: Keypair;
  parseResult?: (value: unknown) => TResult;
}): Promise<{ txHash: string; value: TResult | null }> {
  const rpcServer = getRpcServer();
  const networkPassphrase = getNetworkConfig().networkPassphrase;
  const account = await rpcServer.getAccount(options.sourceKeypair.publicKey());
  const contract = new Contract(options.contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(options.method, ...(options.args ?? []).map(toScVal)))
    .setTimeout(DEFAULT_TIMEOUT_SECONDS)
    .build();

  const simulation = await rpcServer.simulateTransaction(transaction);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed for ${options.method}: ${simulation.error}`);
  }

  const prepared = await rpcServer.prepareTransaction(transaction);
  prepared.sign(options.sourceKeypair);

  const sendResponse = await rpcServer.sendTransaction(prepared);
  if (sendResponse.status === 'ERROR') {
    throw new Error(`Soroban submission failed for ${options.method}`);
  }

  let txResponse: rpc.Api.GetTransactionResponse | null = null;
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const current = await rpcServer.getTransaction(sendResponse.hash);
    if (current.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      txResponse = current;
      break;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  if (!txResponse) {
    throw new Error(`Transaction confirmation timed out for ${options.method}`);
  }
  if (txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed with status: ${txResponse.status}`);
  }

  const raw = txResponse.returnValue ? scValToNative(txResponse.returnValue) : null;
  const value = raw != null && options.parseResult ? options.parseResult(raw) : (raw as TResult);

  logger.info(`Soroban invocation ${options.method} succeeded: ${sendResponse.hash}`);
  return { txHash: sendResponse.hash, value };
}
