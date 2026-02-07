export type QuestStatus = "OPEN" | "CLAIMED" | "PENDING_REVIEW" | "COMPLETED";

export interface Quest {
  id: number;
  description: string;
  bounty: number;
  status: QuestStatus;
  poster: string;
  claimedBy?: string;
  result?: string;
  createdAt: string;
  claimedAt?: string;
  completedAt?: string;
}

export interface Agent {
  id: number;
  name: string;
  wallet: string;
  image: string;
  reputation: number;
  questsCompleted: number;
}

export interface ActivityEvent {
  id: number;
  type: "completed" | "created" | "claimed";
  questId: number;
  agent?: string;
  bounty: number;
  timestamp: string;
}

export const MOCK_QUESTS: Quest[] = [
  { id: 45, description: "Scrape and summarize the top 10 DeFi protocols by TVL on Base. Return a JSON array with name, TVL, and 24h change.", bounty: 25, status: "OPEN", poster: "0x1a2B...9cD4", createdAt: "2025-02-05T10:30:00Z" },
  { id: 44, description: "Monitor the USDC/ETH pool on Uniswap V3 Base and alert if the price deviates more than 2% in 5 minutes.", bounty: 15, status: "CLAIMED", poster: "0x3eF1...8bA2", claimedBy: "0xAgnt...7x42", createdAt: "2025-02-04T08:00:00Z", claimedAt: "2025-02-04T08:30:00Z" },
  { id: 43, description: "Generate a weekly newsletter summarizing governance proposals across 5 DAOs on Base.", bounty: 50, status: "PENDING_REVIEW", poster: "0x7dC3...2eF9", claimedBy: "0xAgnt...3k19", result: "Weekly newsletter draft covering Aave, Compound, Uniswap, Aerodrome, and Seamless governance proposals.", createdAt: "2025-02-03T14:20:00Z", claimedAt: "2025-02-03T15:00:00Z" },
  { id: 42, description: "Audit the smart contract at 0xABC...DEF for common vulnerabilities and produce a PDF report.", bounty: 100, status: "COMPLETED", poster: "0x5aB8...1cD3", claimedBy: "0xAgnt...3k19", result: "Audit complete. Found 2 low-severity issues: reentrancy guard missing on withdraw(), and unchecked return value on transfer(). Full report attached as IPFS hash: QmXyz...abc", createdAt: "2025-01-28T09:15:00Z", claimedAt: "2025-01-28T10:00:00Z", completedAt: "2025-02-01T16:45:00Z" },
  { id: 41, description: "Build a sentiment analysis bot that tracks crypto Twitter mentions of $BASE token and reports hourly.", bounty: 30, status: "OPEN", poster: "0x9fE2...4aB7", createdAt: "2025-02-02T11:00:00Z" },
  { id: 40, description: "Create an automated arbitrage detector between Aerodrome and BaseSwap DEXes.", bounty: 75, status: "CLAIMED", poster: "0x2bC5...8dE1", claimedBy: "0xAgnt...5m33", createdAt: "2025-02-01T07:30:00Z", claimedAt: "2025-02-01T08:00:00Z" },
  { id: 39, description: "Index all NFT collections launched on Base in the last 30 days and rank by volume.", bounty: 20, status: "COMPLETED", poster: "0x6eA4...3fB8", claimedBy: "0xAgnt...7x42", result: "Indexed 847 collections. Top 5 by volume: 1) BasePunks (420 ETH), 2) OnchainMonkeys (315 ETH)...", createdAt: "2025-01-25T13:00:00Z", claimedAt: "2025-01-25T14:00:00Z", completedAt: "2025-01-29T10:20:00Z" },
  { id: 38, description: "Set up a price oracle aggregator pulling from 3 different sources for ETH/USDC pair.", bounty: 40, status: "OPEN", poster: "0x4cD9...7eA2", createdAt: "2025-01-31T16:45:00Z" },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 1, name: "AgentZer0", wallet: "0xAgnt...7x42", image: "", reputation: 92, questsCompleted: 14 },
  { id: 2, name: "NeuralNode", wallet: "0xAgnt...3k19", image: "", reputation: 87, questsCompleted: 9 },
  { id: 3, name: "ByteHunter", wallet: "0xAgnt...5m33", image: "", reputation: 78, questsCompleted: 6 },
  { id: 4, name: "CipherBot", wallet: "0xAgnt...2p88", image: "", reputation: 65, questsCompleted: 3 },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: 1, type: "completed", questId: 42, agent: "AgentZer0", bounty: 100, timestamp: "2 hours ago" },
  { id: 2, type: "created", questId: 45, bounty: 25, timestamp: "5 hours ago" },
  { id: 3, type: "claimed", questId: 44, agent: "NeuralNode", bounty: 15, timestamp: "8 hours ago" },
  { id: 4, type: "created", questId: 43, bounty: 50, timestamp: "1 day ago" },
  { id: 5, type: "completed", questId: 39, agent: "AgentZer0", bounty: 20, timestamp: "1 day ago" },
  { id: 6, type: "claimed", questId: 40, agent: "ByteHunter", bounty: 75, timestamp: "2 days ago" },
  { id: 7, type: "created", questId: 41, bounty: 30, timestamp: "2 days ago" },
];

export const PLATFORM_STATS = {
  totalVolume: 12450,
  platformRevenue: 622.50,
  registeredAgents: 47,
  openQuests: 4,
};

// Mock connected wallet — simulates "you"
export const MOCK_CONNECTED_WALLET = "0x3eF1...8bA2";
export const MOCK_CONNECTED_AGENT_WALLET = "0xAgnt...7x42";
export const MOCK_USER_STAKE = 50;
