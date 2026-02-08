import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getContracts, formatUSDC, getDeployBlock, DEFAULT_CHAIN_ID, fetchEventsChunked } from '@/lib/blockchain/client';

export interface QuestEvent {
  type: 'created' | 'claimed' | 'completed';
  questId: bigint;
  actor: string;
  bounty?: bigint;
  blockNumber: bigint;
}

export function useQuestEvents() {
  const client = usePublicClient();
  const [events, setEvents] = useState<QuestEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const contracts = getContracts();

    async function fetchEvents() {
      try {
        const fromBlock = getDeployBlock(DEFAULT_CHAIN_ID);

        const eventParams = {
          address: contracts.clawQuests.address,
          abi: contracts.clawQuests.abi,
          fromBlock,
        };
        const [created, claimed, completed] = await Promise.all([
          fetchEventsChunked(client!, { ...eventParams, eventName: 'QuestCreated' }),
          fetchEventsChunked(client!, { ...eventParams, eventName: 'QuestClaimed' }),
          fetchEventsChunked(client!, { ...eventParams, eventName: 'QuestCompleted' }),
        ]);

        const allEvents: QuestEvent[] = [
          ...created.map((e) => ({
            type: 'created' as const,
            questId: (e.args as { questId: bigint }).questId,
            actor: (e.args as { creator: string }).creator,
            bounty: (e.args as { bountyAmount: bigint }).bountyAmount,
            blockNumber: e.blockNumber,
          })),
          ...claimed.map((e) => ({
            type: 'claimed' as const,
            questId: (e.args as { questId: bigint }).questId,
            actor: (e.args as { claimer: string }).claimer,
            blockNumber: e.blockNumber,
          })),
          ...completed.map((e) => ({
            type: 'completed' as const,
            questId: (e.args as { questId: bigint }).questId,
            actor: (e.args as { claimer: string }).claimer,
            bounty: (e.args as { payout: bigint }).payout,
            blockNumber: e.blockNumber,
          })),
        ];

        // Sort newest first
        allEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        setEvents(allEvents.slice(0, 20));
      } catch (err) {
        console.error('Failed to fetch quest events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [client]);

  return { events, isLoading };
}

export function formatEventLabel(e: QuestEvent): string {
  const addr = `${e.actor.slice(0, 6)}...${e.actor.slice(-4)}`;
  switch (e.type) {
    case 'completed':
      return `Quest #${e.questId} completed by ${addr}${e.bounty ? ` for ${formatUSDC(e.bounty)} USDC` : ''}`;
    case 'created':
      return `New quest #${e.questId} created${e.bounty ? ` with ${formatUSDC(e.bounty)} USDC bounty` : ''}`;
    case 'claimed':
      return `Quest #${e.questId} claimed by ${addr}`;
  }
}
