# ClawQuests

**Project:** Onchain quest marketplace for AI agents on Base
**Repo:** `git@github.com:DevZenPro/clawquests.git`

---

## Phase Status

| Phase | Status |
|-------|--------|
| 0. Architecture | Done |
| 1. Smart Contracts | Done (60 tests passing) |
| 2. Frontend Infra | Done |
| 3. Frontend Integration | Done (wagmi/connectkit wired) |
| 4. Deployment | Pending |
| 5. Launch | Pending |

### Deployment Checklist

- [x] All contract tests pass (29/29)
- [x] Frontend builds without errors
- [x] Deploy to Base Sepolia
- [ ] ~~Verify contract on BaseScan~~ (skipped — keeping code private)
- [x] Update `src/config/chains.ts` with deployed address
- [x] Deploy frontend to Vercel (clawquests.vercel.app)
- [ ] E2E test on testnet
- [ ] Deploy to Base Mainnet

---

## Environment

```bash
# Foundry (forge needs explicit PATH)
export PATH="$HOME/.foundry/bin:$PATH"
forge test -vvv                          # from contracts/
forge test --gas-report

# Frontend
npm run dev
npm run build
```

Note: zoxide `cd` hook causes errors in subshells — wrap with `bash -c` if needed.

---

## Project Structure

```
clawquests/
├── CLAUDE.md                 # This file
├── contracts/
│   ├── CLAUDE.md             # Contract implementation spec
│   ├── src/
│   │   ├── IClawQuests.sol   # Interface (DO NOT MODIFY)
│   │   └── ClawQuests.sol    # Implementation (complete)
│   ├── test/
│   │   └── ClawQuests.t.sol  # 29 tests (all passing)
│   └── foundry.toml
├── src/
│   ├── CLAUDE.md             # Frontend integration spec
│   ├── providers/Web3Provider.tsx  # WagmiProvider + ConnectKit
│   ├── config/chains.ts      # Chain configs (addresses TBD)
│   ├── lib/blockchain/       # ABIs, client utils, types
│   ├── pages/                # All wired with wagmi hooks
│   └── components/           # UI components
└── package.json
```

---

## Key Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_STAKE | 0.2 USDC (0.2e6) initial, owner-configurable | Required to create quests |
| CREATION_FEE | 0.10 USDC (0.1e6) | Per quest |
| PLATFORM_FEE | 5% (500 bps) | Of bounty on completion |
| REFERRAL_SHARE | 20% (2000 bps) | Of platform fee |
| CLAIM_TIMEOUT | 24 hours | Before reclaim allowed |
| MIN_BOUNTY | 0.1 USDC (0.1e6) initial, owner-configurable | Minimum bounty |

---

## Contract Addresses

### Base Sepolia (Testnet)
```
USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
IdentityRegistry: 0x8004A818BFB912233c491871b3d84c89A494BD9e
ReputationRegistry: 0x8004B663056A597Dffe9eCcC1965A193B7388713
ClawQuests: 0x5d52D4247329037a5Bceb8991c12963Db763351d
```

### Base Mainnet
```
USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
IdentityRegistry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
ReputationRegistry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
ClawQuests: 0x78f6421A4D3FE3A2967d5c2601A13fF9482044aE
```

---

## Future Features (Nice-to-Have)

- **Optimistic Approval**: If the quest creator doesn't reject within 48h of submission, auto-approve the quest. Solves the trust gap where creators can ghost agents who submitted valid work.
- **Dispute Resolution**: Third-party arbitrator role for contested submissions.
- **EAS Attestations**: Use Ethereum Attestation Service for portable reputation that works across protocols.

---

## Changelog

All changes are tracked in `.claude/memory/CHANGELOG.md` (auto-loaded by Claude).
When making changes, append an entry with the date and summary.
