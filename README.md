<div align="center">

# LatterFix

<img src="./docs/images/logo.png" alt="LatterFix Logo" width="120" height="120">

### Decentralized Payroll & Task Management Platform

**Powered by Stellar Soroban Smart Contracts**

<p align="center">
  <img src="./docs/images/hero-banner.png" alt="LatterFix - Decentralized Payroll Platform on Stellar" width="700">
</p>

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-orange.svg)](https://stellar.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)

[Live Demo](https://latterfix-frontend.vercel.app/) · [PRD (Markdown)](./docs/specs/LatterFix_PRD.md) · [Download PRD (PDF)](./docs/specs/LatterFix_PRD.pdf) · [Report Bug](https://github.com/LatterFixxx/LatterFix-frontend/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📸 Screenshots](#-screenshots)
- [🔧 Technology Stack](#-technology-stack)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## Overview

**LatterFix** is a fully on-chain **decentralized task management and escrow platform** built on **Stellar Soroban smart contracts**. It allows task creators to fund work via smart contract escrow, and contributors to earn instant USDC/XLM/EURC payouts the moment their delivery is verified — entirely without a centralized backend.

Every user action (task creation, assignment, work submission, dispute, governance vote) constructs a real Soroban transaction using `@stellar/stellar-sdk`, simulates it against the Soroban RPC, routes the XDR to the user's wallet for signing (Freighter, xBull, Lobstr), and polls for ledger confirmation before updating the UI.

### The Problem We Solve

| Challenge | Traditional Systems | LatterFix Solution |
|-----------|---------------------|-------------------|
| **Payment Trust** | 40% of freelancers face payment disputes | Smart contract escrow ensures guaranteed payments |
| **Transaction Fees** | 5-15% for international transfers | ~$0.000005 per transaction on Stellar |
| **Settlement Time** | 3-5 business days | 3-5 seconds finality |
| **Global Access** | Requires bank account | Only needs internet & wallet |
| **Reputation Tracking** | Platform-locked, opaque | On-chain, portable reputation |

### Why Stellar?

```
┌─────────────────────────────────────────────────────────────────┐
│                     Why We Built on Stellar                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ⚡ LIGHTNING FAST          💰 NEAR-ZERO FEES                  │
│   3-5 second settlement      $0.000005 per transaction          │
│                                                                  │
│   🌍 GLOBAL ACCESS           🔐 TRUSTLESS ESCROW                │
│   50+ currencies via anchors Smart contract locked funds        │
│                                                                  │
│   📜 IMMUTABLE RECORDS       🏦 NO BANK REQUIRED                │
│   All transactions on ledger  Financial inclusion for all       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### ⛓️ Real Soroban Contract Integration
- **Full transaction lifecycle** — Simulate → Prepare → Sign → Submit → Poll for every action
- **20+ contract methods** exposed via `sorobanTaskContract.ts` service
- **Wallet support** — Freighter, xBull, Lobstr via `@creit.tech/stellar-wallets-kit`
- **Simulation-first** — Every tx is simulated against Soroban RPC before wallet prompt

### 🔒 On-Chain Escrow
- **`create_task()`** locks reward tokens in Soroban contract storage
- **`complete_task()`** releases net payout (reward minus 2.5% platform fee) to contributor
- **`dispute_task()`** freezes escrow awaiting admin `resolve_dispute()` with custom split
- **`cancel_task()`** refunds creator in full

### 📊 Live Horizon & RPC Data
- **Real account balances** — XLM, USDC, EURC queried from Horizon on every page
- **Network congestion** — Live fee stats from `/fee_stats` endpoint in AppNav
- **Transaction history** — Paginated Horizon tx list, claimable balances, Soroban `getEvents`
- **Live ledger number** — Shown on landing page, updates on mount

### 🗳️ On-Chain Governance
- **`create_proposal()` / `cast_vote()` / `execute_proposal()`** all wallet-signed
- **`grant_role()` / `pause_all()` / `unpause_all()`** for admin circuit-breaking
- Live proposals fetched from Soroban RPC on page load

### 👤 On-Chain Profiles & Reputation
- **Tiered reputation system** — Newcomer → Contributor → Expert → Master → Legend
- **`get_profile()` / `get_user_reputation()` / `get_user_tier()`** called from Profile page
- **`slash_reputation()` / `reward_contribution()`** for admin reputation management
- **`total_earnings`** tracked cumulatively in on-chain profile storage

### 🛡️ Access Control & Pausable
- **Role-based auth** — Admin / Moderator / Verifier with `require_auth()` guards
- **Granular pause** — Each of 7 actions can be independently paused/unpaused
- **Emergency circuit-breaker** — `pause_all()` halts the entire contract in one call

---

## 🏗️ Architecture

LatterFix is a **backend-free dApp** — all state lives on the Stellar ledger.

```
┌──────────────────────────────────────────────────────────────────┐
│                      LATTERFIX ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  React 19 + TypeScript (Vite)                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │Dashboard │ │Explorer  │ │Escrow Mgr│ │Governance│ │Profile │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │
│       │             │            │             │            │       │
│  ┌────▼─────────────▼────────────▼─────────────▼────────────▼────┐ │
│  │         useContractTask / useHorizonAccount hooks              │ │
│  │         sorobanTaskContract.ts service layer                   │ │
│  └─────────────────────────────┬──────────────────────────────────┘ │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────┐   │
│  │           Stellar Wallets Kit (Freighter / xBull / Lobstr)   │   │
│  │         simulate → prepare XDR → sign → submit → poll       │   │
│  └──────────────────────────────┬──────────────────────────────┘   │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
               ┌──────────────────┴──────────────────┐
               │                                     │
   ┌───────────▼───────────┐           ┌─────────────▼────────────┐
   │   Soroban RPC          │           │   Stellar Horizon API     │
   │  simulateTransaction   │           │  account balances        │
   │  sendTransaction       │           │  tx history              │
   │  getEvents (contract)  │           │  fee_stats (live)        │
   │  getTransaction        │           │  claimable balances      │
   └───────────┬────────────┘           └─────────────┬────────────┘
               │                                       │
               └──────────────────┬────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Stellar Testnet Ledger      │
                    │  LatterFix TaskManager       │
                    │  Soroban Contract (Rust/Wasm) │
                    └──────────────────────────────┘
```

### Data Flow: Payroll Payment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PAYROLL PAYMENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Organization Admin          LatterFix Platform            Stellar Network
        │                           │                              │
        │  1. Create Payroll Batch  │                              │
        │──────────────────────────▶│                              │
        │                           │                              │
        │  2. Fund Batch (USDC)     │                              │
        │──────────────────────────▶│                              │
        │                           │  3. Lock in Escrow           │
        │                           │─────────────────────────────▶│
        │                           │                              │
        │                           │  ⏳ Awaiting Completion      │
        │                           │                              │
        │  4. Approve Payments      │                              │
        │──────────────────────────▶│                              │
        │                           │  5. Execute Bulk Payment     │
        │                           │─────────────────────────────▶│
        │                           │                              │
        │                           │  ⚡ 3-5 second settlement    │
        │                           │◀─────────────────────────────│
        │                           │                              │
        │  6. Confirmation          │                              │
        │◀──────────────────────────│                              │
        │                           │                              │
        │                    Employees Receive                      │
        │                    Instant Payment 💰                      │
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** 6+
- **Stellar Wallet** (Freighter recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/LatterFix/LatterFix-frontend.git
cd LatterFix-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
cd backend
npm run db:migrate

# Start development servers
npm run dev
```

### Environment Configuration

```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/latterfix
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
STELLAR_NETWORK=testnet

# Frontend (.env)
VITE_API_URL=http://localhost:3001
VITE_STELLAR_NETWORK=testnet
```

### Development Servers

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React + Vite dev server |
| Backend | 3001 | Express API server |
| Redis | 6379 | Cache & job queues |

---

## 📸 Application Showcase

### Brand Identity & Design System
<p align="center">
  <img src="./docs/images/logo.png" alt="LatterFix Logo" width="200" height="200">
</p>

### Interactive Landing & Contract Explorer
Our root layout showcases an interactive contract browser designed to let developers explore, query, and test Soroban functions directly from their browser:
<p align="center">
  <img src="./docs/images/hero-banner.png" alt="LatterFix Hero Banner" width="800">
</p>

### Enterprise Workspace & Operations
The workspace dashboard integrates employee rosters, smart escrow trackers, and historical transaction ledgers into a single, cohesive pane:
<p align="center">
  <img src="./docs/images/dashboard-overview.png" alt="LatterFix Dashboard Overview" width="800">
</p>

---

## 🎨 Visual Architecture

### System Architecture Diagram

```mermaid
graph TD
    User([User Client]) -->|Web3 Wallet| WalletKit[Stellar Wallets Kit]
    User -->|React Router| FE[React 19 Frontend]
    FE -->|Zustand Store| Store[Zustand Local State]
    FE -->|HTTPS / WSS| BE[Node.js Express Backend]
    BE -->|Query / Mutate| DB[(PostgreSQL Database)]
    BE -->|Job Queues| Queue[BullMQ + Redis]
    WalletKit -->|Sign Tx| Stellar[Stellar Network Ledger]
    FE -->|Query State| Stellar
```

### Payment Escrow Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Organization Admin
    participant Platform as LatterFix Platform
    participant Stellar as Stellar Ledger
    actor Contributor as Assigned Contributor

    Admin->>Platform: Create Task & Set Reward
    Admin->>Platform: Fund Escrow (XLM/USDC)
    Platform->>Stellar: Lock Tokens in Soroban Escrow Contract
    Contributor->>Platform: Apply & Accept Assignment
    Contributor->>Platform: Complete Work & Submit Delivery URL
    Admin->>Platform: Verify Deliverable
    Platform->>Stellar: Trigger verify() release
    Stellar->>Platform: Deduct Platform Fee (2.5%)
    Stellar->>Contributor: Disburse Net Payout
```

### Multi-Tenant Isolation Flow

```mermaid
graph LR
    TenantA[Tenant A Session] -->|JWT Claims| RLS[PostgreSQL Row-Level Security]
    TenantB[Tenant B Session] -->|JWT Claims| RLS
    RLS -->|Scope Isolation| Table[(Organization Ledger Table)]
    Table -->|Only Tenant A Data| TenantA
    Table -->|Only Tenant B Data| TenantB
```

---

## 🔧 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|--------|
| **React** | 19 | UI framework |
| **TypeScript** | 5.9 | Type safety |
| **Vite** | 7 | Build tool |
| **Zustand** | latest | Client state management |
| **@stellar/stellar-sdk** | latest | Transaction building, XDR, Horizon |
| **@creit.tech/stellar-wallets-kit** | latest | Freighter / xBull / Lobstr |
| **Vanilla CSS** | — | Styling (no Tailwind) |
| **lucide-react** | latest | Icons |

### Stellar Integration Layer
| Module | What it does |
|--------|--------------|
| `sorobanTaskContract.ts` | 20+ contract methods, simulate → sign → poll |
| `stellar.ts` | Horizon account ops, path payments, claimable balances, trustlines |
| `transactionHistory.ts` | Paginated Horizon txs, `getEvents` RPC, fee stats |
| `useContractTask.ts` | React hook wiring contract actions to wallet |
| `useHorizonAccount.ts` | Live XLM/USDC/EURC balances from Horizon |

### Smart Contract (Rust / Soroban)
| Module | Responsibility |
|--------|----------------|
| `lib.rs` | Public contract entrypoint (20+ methods) |
| `escrow.rs` | Task state machine & token locking |
| `governance.rs` | Proposals, voting, execution |
| `reputation.rs` | Tiered points system & leaderboard |
| `access_control.rs` | Role-based auth with `require_auth()` |
| `pausable.rs` | Granular + global circuit-breaker |
| `user_profile.rs` | On-chain profiles, earnings, avatar |
| `storage.rs` | TTL management, statistics, categories |
| `events.rs` | 22 timestamped event emitters |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture Diagram](ARCHITECTURE_DIAGRAM.md) | System architecture details |
| [Multi-Tenant Setup](backend/MULTI_TENANT_SETUP.md) | Tenant configuration guide |
| [API Documentation](backend/README.md) | REST API reference |
| [Testing Guide](backend/TESTING.md) | Test instructions |
| [SDS Integration](backend/docs/SDS_INTEGRATION.md) | Stellar Data Service docs |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Built with ❤️ on Stellar

**[Website](#)** · **[Documentation](#documentation)** · **[Discord](#)** · **[Twitter](#)**

</div>
