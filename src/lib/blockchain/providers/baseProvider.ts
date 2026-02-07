// src/lib/blockchain/providers/baseProvider.ts
// Provider-specific logic for Base chain

import { base, baseSepolia } from '../../../config/chains';
import {
  CLAW_QUESTS_ABI,
  ERC20_ABI,
  IDENTITY_REGISTRY_ABI,
  REPUTATION_REGISTRY_ABI,
} from '../abis';

export type SupportedChainId = typeof base.id | typeof baseSepolia.id;

// Get the chain config based on chain ID
export function getChainConfig(chainId: SupportedChainId) {
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  throw new Error(`Unsupported chain ID: ${chainId}`);
}

// Contract configurations for wagmi hooks
export function getContractConfig(chainId: SupportedChainId) {
  const config = getChainConfig(chainId);

  return {
    clawQuests: {
      address: config.contracts.clawQuests,
      abi: CLAW_QUESTS_ABI,
    },
    usdc: {
      address: config.contracts.usdc,
      abi: ERC20_ABI,
    },
    identityRegistry: {
      address: config.contracts.identityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
    },
    reputationRegistry: {
      address: config.contracts.reputationRegistry,
      abi: REPUTATION_REGISTRY_ABI,
    },
  } as const;
}

// Quest status enum (matching smart contract)
export enum QuestStatus {
  OPEN = 0,
  CLAIMED = 1,
  PENDING_REVIEW = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

// Quest type for frontend use
export interface Quest {
  id: bigint;
  creator: `0x${string}`;
  claimer: `0x${string}` | null;
  title: string;
  description: string;
  bountyAmount: bigint;
  status: QuestStatus;
  createdAt: bigint;
  claimedAt: bigint | null;
  deadline: bigint;
  skillTags: string[];
}

// Agent type from ERC-8004
export interface Agent {
  id: bigint;
  owner: `0x${string}`;
  wallet: `0x${string}` | null;
  uri: string;
  metadata?: Record<string, string>;
}

// Platform stats type
export interface PlatformStats {
  totalQuests: bigint;
  openQuests: bigint;
  totalVolume: bigint;
  totalRevenue: bigint;
  totalAgents: bigint;
}

// Helper to format USDC amounts (6 decimals)
export function formatUSDC(amount: bigint): string {
  const decimals = 6;
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
}

// Helper to parse USDC amounts to bigint
export function parseUSDC(amount: string): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const decimals = 6;
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction);
}

// Claim timeout duration (24 hours in seconds)
export const CLAIM_TIMEOUT_SECONDS = 24 * 60 * 60;

// Minimum stake requirement (10 USDC)
export const MIN_STAKE_AMOUNT = parseUSDC('10');

// Fee constants
export const PLATFORM_FEE_BPS = 500; // 5%
export const CREATION_FEE_USDC = parseUSDC('0.10');
export const REFERRAL_FEE_SHARE_BPS = 2000; // 20% of platform fee
