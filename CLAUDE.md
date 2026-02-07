# ClawQuests — Project Roadmap & To-Do List

**Project:** `ClawQuests`
**Repo:** `git@github.com:DevZenPro/clawquests.git`
**Local Path:** `/home/ops/projects/clawquests/`
**Objective:** Finalize and deploy the `ClawQuests` dApp on Base Mainnet.

This document outlines the remaining tasks to get from the current Lovable-generated UI to a fully functional, onchain application.

---

## ✅ Phase 0: Complete

*   [x] **Architecture Finalized:** `v7` plan with bulletproof mechanics and growth engine is complete.
*   [x] **UI Scaffolding Complete:** Lovable has generated the full Next.js project with all pages, components, and the "Pixel-Lobster-Base" theme.
*   [x] **Project Setup:** The project has been cloned locally and `npm install` has been run.

---

## Phase 1: Smart Contract Development

*   **Status:** `TO-DO`
*   **Owner:** Alvi / Claude Code

**Tasks:**
1.  **[ ] Create Foundry/Hardhat Project:** Set up a new project for the smart contract development.
2.  **[ ] Finalize `ClawQuests.sol`:**
    *   Implement the final version of the contract based on `memory/ClawQuests_Project_Plan.md`.
    *   Ensure all features are included:
        *   Staking to create quests.
        *   Claim timeouts (`reclaimQuest`).
        *   The full approval flow: `submitResult`, `approveCompletion`, `rejectCompletion`.
        *   The onchain referral system (`claimQuestWithReferral` and fee splitting).
        *   Fee discounts for `ClawQuestsPass` holders.
        *   Onchain SVG generation for the `tokenURI`.
3.  **[ ] Write Tests:** Create a comprehensive test suite for the contract, covering all edge cases (especially for fees, timeouts, and approvals).
4.  **[ ] Deploy to Base Sepolia:**
    *   Deploy the final, tested contract to the Base Sepolia testnet.
    *   Verify the contract on BaseScan.
    *   Save the deployed contract address and ABI.

---

## Phase 2: Frontend Refactor & Multi-Chain Prep

*   **Status:** `TO-DO`
*   **Owner:** ZotacClawdBot (Me)

**Tasks:**
1.  **[ ] Create `config/chains.ts`:**
    *   Define the `base` and `baseSepolia` chain objects.
    *   Include contract addresses for `ClawQuests`, `ERC-8004` registries, and `USDC`.
2.  **[ ] Create `lib/blockchain/abis.ts`:**
    *   Store the ABIs for `ClawQuests.sol` and the `ERC-8004` interfaces.
3.  **[ ] Create Modular Providers:**
    *   Create `lib/blockchain/providers/baseProvider.ts`.
    *   This file will contain all the `wagmi` `readContract` and `writeContract` logic specific to Base.
4.  **[ ] Create Generic Client:**
    *   Create `lib/blockchain/client.ts`.
    *   This will be the single entry point for the UI to interact with the blockchain, abstracting away the chain-specific logic.

---

## Phase 3: Frontend Feature Integration

*   **Status:** `TO-DO`
*   **Owner:** Alvi / Claude Code

**Tasks:**
*This is the main body of work. For each page, replace the static mock data from Lovable with live data by calling the functions from `lib/blockchain/client.ts`.*

1.  **[ ] Homepage (`src/pages/Home.tsx`):**
    *   [ ] Wire up the 5 stats cards (TVL, Volume, Revenue, Agents, Open Quests) to their corresponding contract view functions.
    *   [ ] Implement the "Agent Pulse" ticker by listening for `QuestCompleted` events from the smart contract.

2.  **[ ] Quests List Page (`src/pages/Quests.tsx`):**
    *   [ ] Fetch and display the list of open quests from `getOpenQuests()`.
    *   [ ] Implement the multi-select filter for "Skill Tags".

3.  **[ ] Quest Detail Page (`src/pages/QuestDetail.tsx`):**
    *   [ ] Fetch and display all details for a specific quest ID.
    *   [ ] Implement the conditional rendering logic for all action buttons (`Claim`, `Submit`, `Approve`, `Reject`, `Reclaim`).
    *   [ ] Wire up each button to its corresponding `wagmi` `useWriteContract` hook.

4.  **[ ] Create Quest Page (`src/pages/CreateQuest.tsx`):**
    *   [ ] Implement the `useReadContract` hook to check the user's current stake from the `stakes` mapping.
    *   [ ] Conditionally enable/disable the form based on the staking requirement.
    *   [ ] Wire up the "Create Quest" button to handle the USDC approval (`approve`) and the `createQuest` transaction.

5.  **[ ] Staking Page (`src/pages/Staking.tsx`):**
    *   [ ] Display the user's current stake by calling the `stakes` mapping.
    *   [ ] Wire up the "Stake" button (`USDC.approve` + `stake` transaction).
    *   [ ] Wire up the "Unstake" button (`unstake` transaction).

6.  **[ ] Agent Pages (`src/pages/Agents.tsx`, `src/pages/AgentProfile.tsx`):**
    *   [ ] Fetch agent data from the `ERC-8004 IdentityRegistry` contract.
    *   [ ] On the profile page, add the **"Referrals" tab**.
    *   [ ] On this tab, display the user's referral link (`clawquests.xyz/?ref=[address]`).
    *   [ ] Add logic to display referral earnings and a list of referred agents.

---

## Phase 4: Launch

*   **Status:** `TO-DO`
*   **Owner:** Both

**Tasks:**
1.  **[ ] Final E2E Testing:** Thoroughly test the complete flow on Base Sepolia.
2.  **[ ] Deploy to Base Mainnet:**
    *   Deploy `ClawQuests.sol` to Base Mainnet.
    *   Update the `config/chains.ts` file with the mainnet contract address.
3.  **[ ] Deploy Frontend:** Deploy the Next.js app to Vercel.
4.  **[ ] Seed the Platform:** Create the first 5-10 quests to generate initial activity.
5.  **[ ] Announce:** Tweet and post on Farcaster to launch the project.
