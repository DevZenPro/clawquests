# ClawQuests — Multi-Agent Build Guide

**Project:** Onchain quest marketplace for AI agents on Base
**Repo:** `git@github.com:DevZenPro/clawquests.git`

---

## 🎯 Project Overview

ClawQuests is a fully onchain quest marketplace where:
- **Creators** post bounties for tasks (in USDC)
- **AI Agents** claim and complete quests
- **Referrers** earn 20% of platform fees from referred agents

### Key Features
- ERC721 quest NFTs with onchain SVG metadata
- USDC bounties with 5% platform fee
- Perpetual referral system
- Staking requirement for spam prevention
- 24-hour claim timeout protection

---

## 🤖 Agent Deployment Guide

This project is designed for **multi-agent parallel development**. Each agent has its own CLAUDE.md with complete specifications.

### Agent 1: Smart Contract Developer

**Directory:** `/contracts`
**CLAUDE.md:** `contracts/CLAUDE.md`

```bash
# Run from project root
cd /home/ops/projects/clawquests/contracts
claude "Implement all TODO functions in ClawQuests.sol and all tests in ClawQuests.t.sol. Run forge test until all pass."
```

**Deliverables:**
- Complete `src/ClawQuests.sol` implementation
- Complete `test/ClawQuests.t.sol` tests
- All tests passing

---

### Agent 2: Frontend Integrator

**Directory:** `/src`  
**CLAUDE.md:** `src/CLAUDE.md`

```bash
# Run from project root
cd /home/ops/projects/clawquests
claude "Wire up all React components to the blockchain using wagmi. Follow src/CLAUDE.md."
```

**Deliverables:**
- Web3Provider setup
- All pages integrated with contract reads/writes
- Working wallet connection

---

### Agent 3: Deploy Agent (Run After 1 & 2)

**Directory:** `/contracts`

```bash
cd /home/ops/projects/clawquests/contracts
claude "Deploy ClawQuests.sol to Base Sepolia. Use forge script. USDC address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e. Treasury: [deployer address]. Verify on BaseScan."
```

**Deliverables:**
- Deployed contract address
- Verified on BaseScan
- Updated `src/config/chains.ts` with address

---

## 📁 Project Structure

```
clawquests/
├── CLAUDE.md                 # This file (coordinator)
├── contracts/
│   ├── CLAUDE.md             # Smart contract agent guide
│   ├── src/
│   │   ├── IClawQuests.sol   # ✅ Interface (spec)
│   │   └── ClawQuests.sol    # 🔧 Implementation
│   ├── test/
│   │   └── ClawQuests.t.sol  # 🔧 Tests
│   └── foundry.toml
├── src/
│   ├── CLAUDE.md             # Frontend agent guide
│   ├── config/chains.ts      # ✅ Chain configs
│   ├── lib/blockchain/       # ✅ ABIs & client
│   ├── pages/                # 🔧 Wire up
│   └── components/           # 🔧 Wire up
└── package.json
```

---

## ✅ Phase Status

| Phase | Status | Agent |
|-------|--------|-------|
| 0. Architecture | ✅ Complete | - |
| 1. Smart Contracts | 🔧 Ready | Contract Agent |
| 2. Frontend Infra | ✅ Complete | - |
| 3. Frontend Integration | 🔧 Ready | Frontend Agent |
| 4. Deployment | ⏳ Waiting | Deploy Agent |
| 5. Launch | ⏳ Waiting | - |

---

## 🔑 Key Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_STAKE | 10 USDC | Required to create quests |
| CREATION_FEE | 0.10 USDC | Per quest |
| PLATFORM_FEE | 5% | Of bounty on completion |
| REFERRAL_SHARE | 20% | Of platform fee |
| CLAIM_TIMEOUT | 24 hours | Before reclaim allowed |
| MIN_BOUNTY | 1 USDC | Minimum bounty |

---

## 🔗 Contract Addresses

### Base Sepolia (Testnet)
```
USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
IdentityRegistry: 0x8004A818BFB912233c491871b3d84c89A494BD9e
ReputationRegistry: 0x8004B663056A597Dffe9eCcC1965A193B7388713
ClawQuests: TBD (after deployment)
```

### Base Mainnet
```
USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
IdentityRegistry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
ReputationRegistry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
ClawQuests: TBD (after deployment)
```

---

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test -vvv
forge test --gas-report
```

### Frontend
```bash
npm run dev
npm run typecheck
npm run build
```

---

## 🚀 Deployment Checklist

- [ ] All contract tests pass
- [ ] Frontend builds without errors
- [ ] Deploy to Base Sepolia
- [ ] Verify contract on BaseScan
- [ ] Update chain config with address
- [ ] E2E test on testnet
- [ ] Deploy to Base Mainnet
- [ ] Update chain config with mainnet address
- [ ] Deploy frontend to Vercel

---

Good luck building! 🦞
