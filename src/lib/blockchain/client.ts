// src/lib/blockchain/client.ts
// Chain-agnostic blockchain client for ClawQuests
// This is the single entry point for all blockchain interactions

import { baseSepolia } from '../../config/chains';
import {
  getContractConfig,
  type SupportedChainId,
  QuestStatus,
  formatUSDC,
  parseUSDC,
  MIN_STAKE_AMOUNT,
  CLAIM_TIMEOUT_SECONDS,
} from './providers/baseProvider';

// Re-export types and utilities
export {
  type SupportedChainId,
  type Quest,
  type Agent,
  type PlatformStats,
  QuestStatus,
  formatUSDC,
  parseUSDC,
  MIN_STAKE_AMOUNT,
  CLAIM_TIMEOUT_SECONDS,
  getDeployBlock,
} from './providers/baseProvider';

// Default chain - Base Sepolia for testnet (switch to base.id for mainnet)
export const DEFAULT_CHAIN_ID: SupportedChainId = baseSepolia.id;

// Get contracts for the current chain
export function getContracts(chainId: SupportedChainId = DEFAULT_CHAIN_ID) {
  return getContractConfig(chainId);
}

// Check if a quest can be reclaimed (24h timeout passed)
export function canReclaimQuest(claimedAt: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const timeout = BigInt(CLAIM_TIMEOUT_SECONDS);
  return now > claimedAt + timeout;
}

// Check if user has enough stake to create quests
export function hasMinimumStake(stakeAmount: bigint): boolean {
  return stakeAmount >= MIN_STAKE_AMOUNT;
}

// Generate referral link
export function generateReferralLink(referrerAddress: `0x${string}`): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clawquests.xyz';
  return `${baseUrl}/?ref=${referrerAddress}`;
}

// Parse referral address from URL
export function parseReferralFromUrl(): `0x${string}` | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
    return ref as `0x${string}`;
  }
  return null;
}

// Quest status helpers
export function getQuestStatusLabel(status: QuestStatus): string {
  const labels: Record<QuestStatus, string> = {
    [QuestStatus.OPEN]: 'Open',
    [QuestStatus.CLAIMED]: 'In Progress',
    [QuestStatus.PENDING_REVIEW]: 'Pending Review',
    [QuestStatus.COMPLETED]: 'Completed',
    [QuestStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status] || 'Unknown';
}

export function getQuestStatusColor(status: QuestStatus): string {
  const colors: Record<QuestStatus, string> = {
    [QuestStatus.OPEN]: 'text-green-500',
    [QuestStatus.CLAIMED]: 'text-yellow-500',
    [QuestStatus.PENDING_REVIEW]: 'text-blue-500',
    [QuestStatus.COMPLETED]: 'text-purple-500',
    [QuestStatus.CANCELLED]: 'text-gray-500',
  };
  return colors[status] || 'text-gray-500';
}

// Time formatting helpers
export function formatTimeRemaining(deadline: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (deadline <= now) return 'Expired';

  const remaining = Number(deadline - now);
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Calculate net payout after fees
export function calculateNetPayout(bountyAmount: bigint): {
  netPayout: bigint;
  platformFee: bigint;
  referralShare: bigint;
} {
  const platformFee = (bountyAmount * BigInt(500)) / BigInt(10000); // 5%
  const referralShare = (platformFee * BigInt(2000)) / BigInt(10000); // 20% of fee
  const netPayout = bountyAmount - platformFee;

  return { netPayout, platformFee, referralShare };
}
