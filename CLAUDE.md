# ClawQuests — Project Roadmap (for Claude Code)

**Project:** `ClawQuests`
**Repo:** `git@github.com:DevZenPro/clawquests.git`
**Local Path:** `/home/ops/projects/clawquests/`
**Objective:** Finalize and deploy the `ClawQuests` dApp on Base Mainnet.

This document outlines the remaining tasks to get from the current Lovable-generated UI to a fully functional, onchain application.

---

## ✅ Phase 0: Complete

*   [x] **Architecture Finalized:** Plan is complete with bulletproof mechanics and growth engine.
*   [x] **UI Scaffolding Complete:** Lovable has generated the full Next.js project.
*   [x] **Project Setup:** The project is cloned locally and dependencies are installed.

---

## Phase 1: Smart Contract Development

*   **Status:** `TO-DO`
*   **Owner:** The Dev / Claude Code

**Tasks:**
1.  **[ ] Create Foundry/Hardhat Project:** Set up a new project for smart contract development.
2.  **[ ] Finalize `ClawQuests.sol`:**
    *   Implement the final version of the contract based on the project plan.
    *   Ensure all features are included: Staking, Timeouts, Approval Flow, Referrals, and Fee Discounts.
3.  **[ ] Write Tests:** Create a comprehensive test suite for the contract.
4.  **[ ] Deploy to Base Sepolia:** Deploy, verify, and save the final contract address and ABI.

---

## ✅ Phase 2: Frontend Architecture Refactor

*   **Status:** `COMPLETE`
*   **Owner:** ZotacClawdBot

**Completed:**
1.  **[x] Create `config/chains.ts`:** Base Mainnet and Base Sepolia configurations with contract addresses.
2.  **[x] Create `lib/blockchain/abis.ts`:** ERC-8004 ABIs (from official repo), ERC20 ABI, ClawQuests placeholder ABI.
3.  **[x] Create Modular Providers:** `lib/blockchain/providers/baseProvider.ts` with types, helpers, and constants.
4.  **[x] Create Generic Client:** `lib/blockchain/client.ts` as the single entry point for the UI.

---

## Phase 3: Frontend Feature Integration

*   **Status:** `TO-DO`
*   **Owner:** The Dev / Claude Code

**Tasks:**
*For each page, replace static mock data with live onchain data by wiring up the wagmi hooks.*

1.  **[ ] Homepage (`src/pages/Home.tsx`):**
    *   [ ] Wire up all 5 stats cards (TVL, Volume, etc.) to contract view functions.
    *   [ ] Implement the "Agent Pulse" ticker by listening for contract events.

2.  **[ ] Quests Pages (`src/pages/Quests.tsx`, `src/pages/QuestDetail.tsx`):**
    *   [ ] Fetch and display the list of open quests.
    *   [ ] Implement tag filtering.
    *   [ ] Wire up all conditional action buttons (`Claim`, `Submit Result`, `Approve`, `Reject`, `Reclaim`).

3.  **[ ] Create Quest Page (`src/pages/CreateQuest.tsx`):**
    *   [ ] Implement the staking requirement check.
    *   [ ] Wire up the `createQuest` transaction flow (USDC approval + contract call).

4.  **[ ] Staking Page (`src/pages/Staking.tsx`):**
    *   [ ] Display the user's current stake.
    *   [ ] Wire up the "Stake" and "Unstake" buttons.

5.  **[ ] Agent Pages (`src/pages/Agents.tsx`, `src/pages/AgentProfile.tsx`):**
    *   [ ] Fetch and display agent data from the `ERC-8004` registries.
    *   [ ] Implement the "Referrals" tab on the profile page, showing the referral link and earnings.

---

## Phase 4: Launch

*   **Status:** `TO-DO`
*   **Owner:** The Dev

**Tasks:**
1.  **[ ] Final E2E Testing:** Test the full dApp flow on Base Sepolia.
2.  **[ ] Deploy to Base Mainnet:** Deploy the final `ClawQuests.sol` contract.
3.  **[ ] Deploy Frontend:** Deploy the Next.js app to Vercel.
4.  **[ ] Seed & Announce:** Create the first quests and announce the launch on Twitter and Farcaster.
