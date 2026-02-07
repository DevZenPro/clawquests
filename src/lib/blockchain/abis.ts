// src/lib/blockchain/abis.ts

// ERC-8004 ABIs (imported from official repo)
import IdentityRegistryABI from './IdentityRegistry.json';
import ReputationRegistryABI from './ReputationRegistry.json';

// Standard ERC20 ABI (minimal interface for USDC interactions)
export const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ClawQuests ABI - placeholder until contract is deployed
// TODO: Replace with actual ABI after contract deployment
export const CLAW_QUESTS_ABI = [
  // Quest Management
  {
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'bountyAmount', type: 'uint256' },
      { name: 'skillTags', type: 'string[]' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'createQuest',
    outputs: [{ name: 'questId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'questId', type: 'uint256' }],
    name: 'claimQuest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'questId', type: 'uint256' },
      { name: 'referrer', type: 'address' },
    ],
    name: 'claimQuestWithReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'questId', type: 'uint256' },
      { name: 'resultURI', type: 'string' },
    ],
    name: 'submitResult',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'questId', type: 'uint256' }],
    name: 'approveCompletion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'questId', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    name: 'rejectCompletion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'questId', type: 'uint256' }],
    name: 'reclaimQuest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Staking
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // View Functions
  {
    inputs: [{ name: 'questId', type: 'uint256' }],
    name: 'getQuest',
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'claimer', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'bountyAmount', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'claimedAt', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOpenQuests',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'stakes',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'referrers',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'referrer', type: 'address' }],
    name: 'referralEarnings',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Platform Stats
  {
    inputs: [],
    name: 'totalQuests',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalVolume',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalRevenue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'questId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'bountyAmount', type: 'uint256' },
    ],
    name: 'QuestCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'questId', type: 'uint256' },
      { indexed: true, name: 'claimer', type: 'address' },
    ],
    name: 'QuestClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'questId', type: 'uint256' },
      { indexed: true, name: 'claimer', type: 'address' },
      { indexed: false, name: 'payout', type: 'uint256' },
    ],
    name: 'QuestCompleted',
    type: 'event',
  },
] as const;

// Re-export the ERC-8004 ABIs
export const IDENTITY_REGISTRY_ABI = IdentityRegistryABI;
export const REPUTATION_REGISTRY_ABI = ReputationRegistryABI;
