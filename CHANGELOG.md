# Changelog — LatterFix Frontend

All notable changes to the frontend are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — 2026-07-13

### Added

- **`AppNav`** — Live Stellar network congestion indicator that auto-refreshes from Horizon `/fee_stats` every 60 seconds (green/yellow/red dot with base fee and ledger number). Wallet connect/disconnect flow now shows live XLM balance queried from Horizon, a Stellar Expert deep-link on the address, and an "on-chain" status badge. Mobile nav includes full wallet flow and network status.
- **`LandingPage`** — Live network stats bar (Network / Congestion / Base Fee / Latest Ledger) fetched on mount from Horizon. Metrics section now shows live ledger number instead of static "Testnet" label. Wallet widget copy updated to mention Freighter, xBull, and Lobstr. Contract method count updated to 20+; test count updated to 8/8.
- **`sorobanTaskContract.ts`** — Full Soroban service covering all 20+ contract methods with simulate → prepare → sign → poll lifecycle.
- **`useContractTask.ts`** — React hook wiring every on-chain action to wallet signing.
- **`useHorizonAccount.ts`** — Live XLM/USDC/EURC balance queries from Horizon with trustline checks.
- **`transactionHistory.ts`** — Rewrote to use Horizon REST API: paginated tx history, claimable balances, Soroban RPC `getEvents`, live fee stats.

### Changed

- **`stellar.ts`** — Full rewrite using real `@stellar/stellar-sdk` primitives (claimable balances, path payments, trustlines, direct payments, submission).
- **`CreateTask.tsx`** — Calls `create_task()` / `create_task_with_milestones()` on-chain; shows wallet balance from Horizon; checks trustlines; milestone tab mode.
- **`EscrowManager.tsx`** — `complete_task` / `dispute_task` / `resolve_dispute` via wallet signing; live escrow TVL from Soroban RPC.
- **`Governance.tsx`** — `create_proposal` / `cast_vote` / `pause_all` / `grant_role` all on-chain with live proposals from RPC.
- **`PaymentLedger.tsx`** — 4 real data tabs: local, Horizon account txs (paginated), claimable balances, Soroban contract events.
- **`Home.tsx`** — Live contract stats + wallet balance panel + Horizon fee congestion banner.
- **`.env.example`** — Added `VITE_LATTERFIX_CONTRACT_ID` and mainnet RPC example.

---

## [0.1.0] — 2026-07-11

### Added

- Initial release: full UI scaffolding with Zustand task store, EscrowManager, Governance, CreateTask, TaskExplorer, PaymentLedger, and LandingPage.
- WalletProvider with Freighter/xBull/Lobstr support via `@creit.tech/stellar-wallets-kit`.
- `transactionSimulation.ts` — Soroban RPC simulate endpoint integration.
- `feeEstimation.ts` — Horizon fee stats with congestion-aware fee recommendations.
- `usePayrollContracts.ts` — Payroll contract hooks.
- PRD documentation and architecture diagrams.
