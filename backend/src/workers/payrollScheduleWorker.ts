import { Worker, Job } from 'bullmq';
import { Keypair, Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { redisConnection, SCHEDULE_QUEUE_NAME } from '../config/queue.js';
import {
  PayrollScheduleService,
  PayrollSchedule,
} from '../services/payrollScheduleService.js';
import { simulateReadOnly, invokeWithKeypair } from '../services/sorobanContractService.js';
import { ContractConfigService } from '../services/contractConfigService.js';
import { getNetworkConfig } from '../stellar/network.js';
import logger from '../utils/logger.js';

const configService = new ContractConfigService();

// bulk_payment.execute_batch caps a single call at 100 payments. Schedules
// with more recipients than this are not chunked across multiple sequenced
// calls (a known, documented scope limit — see PR description) and fail
// loudly instead of attempting fragile multi-call sequencing.
const MAX_BATCH_SIZE = 100;

// Soroban Stellar Asset Contracts use 7-decimal stroop precision, matching
// this codebase's existing DECIMAL(20, 7) convention for payroll amounts
// (see payroll_runs.total_amount). Schedule recipient amounts are stored as
// decimal strings in that same unit and converted to i128 stroops here.
const STROOPS_PER_UNIT = 10_000_000;

function toStroops(amount: string): bigint {
  return BigInt(Math.round(parseFloat(amount) * STROOPS_PER_UNIT));
}

function resolveBulkPaymentContractId(): string {
  const { network } = getNetworkConfig();
  const entry = configService
    .getContractEntries()
    .find((e) => e.contractType === 'bulk_payment' && e.network === network);
  if (!entry) {
    throw new Error(`No bulk_payment contract registered for network ${network}`);
  }
  return entry.contractId;
}

/**
 * Encodes one PaymentOp { recipient: Address, amount: i128, category: Symbol }
 * as an ScMap. Soroban serializes #[contracttype] struct fields sorted
 * alphabetically by field name, so entries must be ordered amount < category
 * < recipient.
 */
function paymentOpToScVal(recipient: string, amount: string, category: string): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('amount'),
      val: nativeToScVal(toStroops(amount), { type: 'i128' }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('category'),
      val: xdr.ScVal.scvSymbol(category),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('recipient'),
      val: nativeToScVal(Address.fromString(recipient), { type: 'address' }),
    }),
  ]);
}

async function executeSchedule(schedule: PayrollSchedule): Promise<void> {
  if (schedule.recipients.length > MAX_BATCH_SIZE) {
    throw new Error(
      `Schedule has ${schedule.recipients.length} recipients, exceeding the ${MAX_BATCH_SIZE}-payment limit for a single execute_batch call`
    );
  }

  const senderSecret = process.env.BULK_PAYMENT_SENDER_SECRET;
  if (!senderSecret) {
    throw new Error('BULK_PAYMENT_SENDER_SECRET not configured on server');
  }
  const senderKeypair = Keypair.fromSecret(senderSecret);
  const contractId = resolveBulkPaymentContractId();

  const expectedSequence = await simulateReadOnly<bigint>({
    contractId,
    method: 'get_sequence',
    sourceAddress: senderKeypair.publicKey(),
  });
  if (expectedSequence == null) {
    throw new Error('Failed to read bulk_payment sequence before dispatch');
  }

  const paymentsScVal = xdr.ScVal.scvVec(
    schedule.recipients.map((r) => paymentOpToScVal(r.walletAddress, r.amount, 'payroll'))
  );
  const senderAddressScVal = nativeToScVal(Address.fromString(senderKeypair.publicKey()), {
    type: 'address',
  });
  const tokenAddressScVal = nativeToScVal(Address.fromString(schedule.token_address), {
    type: 'address',
  });

  const { txHash, value } = await invokeWithKeypair<bigint>({
    contractId,
    method: 'execute_batch',
    sourceKeypair: senderKeypair,
    args: [
      senderAddressScVal,
      tokenAddressScVal,
      paymentsScVal,
      nativeToScVal(expectedSequence, { type: 'u64' }),
    ],
  });

  await PayrollScheduleService.recordExecution(schedule, {
    status: 'succeeded',
    txHash,
    batchId: value != null ? Number(value) : undefined,
  });
}

export const payrollScheduleWorker = new Worker(
  SCHEDULE_QUEUE_NAME,
  async (_job: Job) => {
    const dueSchedules = await PayrollScheduleService.findDueSchedules();
    if (dueSchedules.length === 0) {
      logger.info('Schedule dispatch tick: no due schedules');
      return;
    }

    for (const schedule of dueSchedules) {
      try {
        await executeSchedule(schedule);
        logger.info(`Executed payroll schedule ${schedule.id}`);
      } catch (error) {
        logger.error(`Failed to execute payroll schedule ${schedule.id}`, error);
        // Still advances next_run_at (see recordExecution) rather than
        // retrying the same period indefinitely on a permanently-broken
        // schedule (e.g. bad token address); failures are visible via
        // payroll_schedule_runs for manual follow-up.
        await PayrollScheduleService.recordExecution(schedule, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  },
  { connection: redisConnection, concurrency: 1 }
);

payrollScheduleWorker.on('failed', (job, err) => {
  logger.error(`Schedule dispatch job ${job?.id} failed`, err);
});
