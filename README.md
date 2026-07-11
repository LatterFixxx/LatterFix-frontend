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

**LatterFix** is a comprehensive **decentralized payroll and task management platform** built on **Stellar Soroban smart contracts**. It enables organizations to manage employees, process payroll payments, and facilitate task-based collaboration with instant, low-cost crypto payments.

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

### 🏢 Multi-Tenant Organization Management
- **Row-Level Security (RLS)** - Database-level tenant isolation
- **Organization-specific configurations** - Customize payment settings, branding, and security
- **Role-based access control** - Admin, manager, and employee roles
- **Tenant-specific audit logging** - Complete activity tracking per organization

### 💼 Employee Management
- **Employee profiles** with Stellar wallet addresses
- **Department and position tracking**
- **Status management** (active, inactive, pending)
- **Bulk import/export** via CSV/Excel

### 💸 Payroll Processing
- **Multi-currency support** - Pay in USDC, XLM, EURC, and more
- **Batch payment processing** - Pay hundreds of employees in one transaction
- **Smart contract escrow** - Funds locked until conditions met
- **Instant settlements** - 3-5 second finality on Stellar

### 📋 Task Management
- **Task creation with funding** - Create tasks with crypto rewards
- **Contributor assignment** - Assign tasks to qualified workers
- **Completion verification** - Multiple verification methods
- **Instant payment release** - Automatic payout on completion

### 📊 Analytics & Reporting
- **Real-time dashboards** - Transaction history, employee stats
- **Audit reports** - Comprehensive payment tracking
- **Export capabilities** - PDF, Excel, CSV formats
- **Stellar Explorer integration** - On-chain transaction verification

### 🔐 Security & Compliance
- **Multi-factor authentication (2FA)** - TOTP-based security
- **OAuth integration** - Google & GitHub login
- **Stellar wallet connection** - Connect Freighter, Lobstr, and more
- **End-to-end encryption** - Secure data transmission

---

## 🏗️ Architecture

LatterFix follows a modern **three-tier architecture** with Stellar integration:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LATTERFIX ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                                │
│                        (React + TypeScript)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│   │   Dashboard  │  │   Employee   │  │   Payroll    │  │   Tasks    │ │
│   │    Portal    │  │   Management │  │   Dashboard  │  │   Module   │ │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│          │                 │                 │                 │        │
│   ┌──────▼─────────────────▼─────────────────▼─────────────────▼──────┐ │
│   │                    Stellar Wallet Kit                              │ │
│   │        (Freighter, Lobstr, xBull, Albedo, Rabet)                  │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │              State Management (Zustand + React Query)              │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   │ REST API + WebSocket
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                            BACKEND LAYER                                 │
│                      (Node.js + Express + TypeScript)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐   │
│   │  REST API      │  │  WebSocket     │  │  Background Jobs       │   │
│   │  Endpoints     │  │  (Socket.io)   │  │  (BullMQ + Redis)      │   │
│   └───────┬────────┘  └───────┬────────┘  └───────────┬────────────┘   │
│           │                   │                       │                 │
│   ┌───────▼───────────────────▼───────────────────────▼────────────┐   │
│   │                    Business Logic Layer                         │   │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │   │
│   │  │   Payroll   │ │   Search    │ │   Tenant    │              │   │
│   │  │   Service   │ │   Service   │ │   Service   │              │   │
│   │  └─────────────┘ └─────────────┘ └─────────────┘              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │              Stellar Data Service (SDS) Integration               │ │
│   │         High-performance on-chain data querying (86% faster)      │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   │ PostgreSQL + Redis
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                           DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│   │     PostgreSQL Database     │  │         Redis Cache            │   │
│   │  ┌──────────────────────┐  │  │  ┌──────────────────────────┐  │   │
│   │  │ Row-Level Security   │  │  │  │   Session Storage        │  │   │
│   │  │ Tenant Isolation     │  │  │  │   Job Queues            │  │   │
│   │  │ Full-Text Search     │  │  │  │   API Caching           │  │   │
│   │  └──────────────────────┘  │  │  └──────────────────────────┘  │   │
│   └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
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
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript 5.9** | Type safety |
| **Vite 7** | Build tool |
| **Tailwind CSS 4** | Styling |
| **Zustand** | State management |
| **React Query** | Server state |
| **Stellar Wallets Kit** | Wallet connection |
| **Framer Motion** | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime |
| **Express 5** | API framework |
| **TypeScript 5.9** | Type safety |
| **PostgreSQL** | Primary database |
| **Redis** | Cache & queues |
| **Socket.io** | Real-time updates |
| **BullMQ** | Job processing |
| **Stellar SDK** | Blockchain interaction |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Stellar Network** | Blockchain layer |
| **Soroban** | Smart contracts |
| **Stellar Data Service** | High-performance queries |

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
