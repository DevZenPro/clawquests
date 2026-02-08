// src/config/chains.ts

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    clawQuests: `0x${string}`;
    identityRegistry: `0x${string}`;
    reputationRegistry: `0x${string}`;
    usdc: `0x${string}`;
  };
}

export const base: ChainConfig = {
  id: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  explorerUrl: 'https://basescan.org',
  contracts: {
    clawQuests: '0x...', // TODO: Add mainnet address after deployment
    identityRegistry: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
    reputationRegistry: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
};

export const baseSepolia: ChainConfig = {
  id: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
  contracts: {
    clawQuests: '0x4438d7FB07592D489De26582408577ABfbAfFEa7',
    identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
    reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  },
};

export const supportedChains: Record<number, ChainConfig> = {
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
};
