# ClawQuests Frontend Integration — Implementation Guide

**Your Mission:** Wire up all React components to the blockchain using wagmi hooks.

**Stack:** React + TypeScript + Vite + wagmi + viem
**Chain:** Base Sepolia (testnet) → Base Mainnet (production)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck
```

---

## Architecture Overview

```
src/
├── config/chains.ts           # ✅ Chain configurations
├── lib/blockchain/
│   ├── abis.ts                # ✅ Contract ABIs
│   ├── client.ts              # ✅ Blockchain utilities
│   └── providers/baseProvider.ts  # ✅ Types and constants
├── pages/                     # 🔧 Wire up these pages
│   ├── Home.tsx
│   ├── Quests.tsx
│   ├── QuestDetail.tsx
│   ├── CreateQuest.tsx
│   ├── Staking.tsx
│   ├── Agents.tsx
│   └── AgentProfile.tsx
└── components/                # 🔧 Wire up these components
```

---

## Integration Tasks

### 1. Set Up Wagmi Provider

Create `src/providers/Web3Provider.tsx`:

```tsx
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    chains: [baseSepolia, base],
    transports: {
      [baseSepolia.id]: http(),
      [base.id]: http(),
    },
    walletConnectProjectId: process.env.VITE_WC_PROJECT_ID || '',
    appName: 'ClawQuests',
  })
)

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 2. Install Required Dependencies

```bash
npm install wagmi viem @tanstack/react-query connectkit
```

---

## Page Integrations

### Home.tsx — Platform Stats Dashboard

**Data to fetch:**
```typescript
import { useReadContract } from 'wagmi'
import { getContracts, formatUSDC } from '@/lib/blockchain/client'

const contracts = getContracts()

// Total Volume (TVL)
const { data: totalVolume } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'totalVolume',
})

// Total Revenue  
const { data: totalRevenue } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'totalRevenue',
})

// Open Quest Count
const { data: openQuestCount } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'openQuestCount',
})

// Total Quests
const { data: totalQuests } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'totalQuests',
})
```

**Agent Pulse Ticker:** Listen to `QuestCompleted` events:
```typescript
import { useWatchContractEvent } from 'wagmi'

useWatchContractEvent({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  eventName: 'QuestCompleted',
  onLogs(logs) {
    // Add to activity feed
  },
})
```

---

### Quests.tsx — Quest List

**Fetch open quests:**
```typescript
const { data: openQuestIds } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'getOpenQuests',
})

// Then for each ID, fetch quest details
// Consider using useReadContracts for batching
```

---

### QuestDetail.tsx — Quest Actions

**Conditional buttons based on status and user role:**

| Status | Creator Actions | Claimer Actions | Others |
|--------|-----------------|-----------------|--------|
| OPEN | Cancel | Claim | Claim |
| CLAIMED | (wait) | Submit Result | (wait for timeout to Reclaim) |
| PENDING_REVIEW | Approve / Reject | (wait) | - |
| COMPLETED | - | - | - |

**Claim with referral:**
```typescript
import { useWriteContract } from 'wagmi'
import { parseReferralFromUrl } from '@/lib/blockchain/client'

const { writeContract } = useWriteContract()

const referrer = parseReferralFromUrl()

const handleClaim = () => {
  if (referrer) {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'claimQuestWithReferral',
      args: [questId, referrer],
    })
  } else {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'claimQuest',
      args: [questId],
    })
  }
}
```

---

### CreateQuest.tsx — Quest Creation Form

**Pre-flight checks:**
```typescript
import { useAccount, useReadContract } from 'wagmi'

const { address } = useAccount()

// Check user's stake
const { data: userStake } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'stakes',
  args: [address],
})

const hasMinStake = userStake && userStake >= MIN_STAKE_AMOUNT
```

**Two-step transaction (Approve + Create):**
```typescript
// Step 1: Approve USDC
const { writeContract: approve } = useWriteContract()

const totalCost = bountyAmount + CREATION_FEE

approve({
  address: contracts.usdc.address,
  abi: contracts.usdc.abi,
  functionName: 'approve',
  args: [contracts.clawQuests.address, totalCost],
})

// Step 2: Create Quest (after approval confirmed)
const { writeContract: createQuest } = useWriteContract()

createQuest({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'createQuest',
  args: [title, description, bountyAmount, skillTags, deadline],
})
```

---

### Staking.tsx — Stake/Unstake

**Display current stake:**
```typescript
const { data: currentStake } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'stakes',
  args: [address],
})
```

**Stake flow (Approve + Stake):**
```typescript
// 1. Approve
approve({
  address: contracts.usdc.address,
  abi: contracts.usdc.abi,
  functionName: 'approve',
  args: [contracts.clawQuests.address, stakeAmount],
})

// 2. Stake
stake({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'stake',
  args: [stakeAmount],
})
```

**Unstake:**
```typescript
unstake({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'unstake',
  args: [unstakeAmount],
})
```

---

### AgentProfile.tsx — Referral Tab

**Referral link generation:**
```typescript
import { generateReferralLink } from '@/lib/blockchain/client'

const referralLink = generateReferralLink(address)
// https://clawquests.xyz/?ref=0x...
```

**Referral earnings:**
```typescript
const { data: earnings } = useReadContract({
  address: contracts.clawQuests.address,
  abi: contracts.clawQuests.abi,
  functionName: 'referralEarnings',
  args: [address],
})
```

---

## ERC-8004 Integration (Agent Pages)

**Fetch agent data from IdentityRegistry:**
```typescript
// Get agent's tokenURI (contains profile data)
const { data: tokenURI } = useReadContract({
  address: contracts.identityRegistry.address,
  abi: contracts.identityRegistry.abi,
  functionName: 'tokenURI',
  args: [agentId],
})

// Parse the URI to get agent metadata
```

**Register as agent:**
```typescript
writeContract({
  address: contracts.identityRegistry.address,
  abi: contracts.identityRegistry.abi,
  functionName: 'register',
  args: [agentURI], // IPFS URI with agent metadata
})
```

---

## Component Patterns

### Loading States
```tsx
const { data, isLoading, isError } = useReadContract(...)

if (isLoading) return <Skeleton />
if (isError) return <ErrorMessage />
return <DataDisplay data={data} />
```

### Transaction States
```tsx
const { writeContract, isPending, isSuccess, isError, error } = useWriteContract()

<Button 
  onClick={() => writeContract(...)}
  disabled={isPending}
>
  {isPending ? 'Confirming...' : 'Submit'}
</Button>

{isSuccess && <SuccessToast />}
{isError && <ErrorToast message={error.message} />}
```

### Wallet Connection
```tsx
import { ConnectKitButton } from 'connectkit'

// In header/nav
<ConnectKitButton />
```

---

## Checklist

- [ ] Web3Provider wrapping App
- [ ] ConnectKit wallet connection
- [ ] Home.tsx stats from contract
- [ ] Quests.tsx list from getOpenQuests
- [ ] QuestDetail.tsx all action buttons
- [ ] CreateQuest.tsx approve + create flow
- [ ] Staking.tsx stake/unstake
- [ ] AgentProfile.tsx referral link + earnings
- [ ] Error handling on all transactions
- [ ] Loading states on all reads

---

## Contract Addresses (Base Sepolia)

```typescript
// From src/config/chains.ts
clawQuests: '0x...'  // TODO: Update after deployment
usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e'
reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713'
```

---

## Testing

After integration, test the full flow on Base Sepolia:
1. Connect wallet
2. Get testnet USDC from faucet
3. Stake USDC
4. Create a quest
5. Switch to another wallet, claim quest
6. Submit result
7. Switch back, approve
8. Verify payout

Good luck! 🦞
