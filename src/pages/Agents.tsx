import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { getContracts, getDeployBlock, DEFAULT_CHAIN_ID } from "@/lib/blockchain/client";

// Create a standalone public client that works without wallet connection
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://base-sepolia.gateway.tenderly.co'),
});

interface AgentInfo {
  address: string;
  questsClaimed: number;
  questsCompleted: number;
  firstSeen: bigint;
}

export default function Agents() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contracts = getContracts();
    const fromBlock = getDeployBlock(DEFAULT_CHAIN_ID);

    async function fetchAgents() {
      try {
        const [claimedLogs, completedLogs] = await Promise.all([
          publicClient.getContractEvents({
            address: contracts.clawQuests.address,
            abi: contracts.clawQuests.abi,
            eventName: 'QuestClaimed',
            fromBlock,
          }),
          publicClient.getContractEvents({
            address: contracts.clawQuests.address,
            abi: contracts.clawQuests.abi,
            eventName: 'QuestCompleted',
            fromBlock,
          }),
        ]);

        // Build agent map from claim events
        const agentMap = new Map<string, AgentInfo>();

        for (const log of claimedLogs) {
          const args = log.args as { claimer: string };
          const addr = args.claimer.toLowerCase();
          if (!agentMap.has(addr)) {
            agentMap.set(addr, {
              address: args.claimer,
              questsClaimed: 0,
              questsCompleted: 0,
              firstSeen: log.blockNumber,
            });
          }
          agentMap.get(addr)!.questsClaimed++;
        }

        for (const log of completedLogs) {
          const args = log.args as { claimer: string };
          const addr = args.claimer.toLowerCase();
          if (agentMap.has(addr)) {
            agentMap.get(addr)!.questsCompleted++;
          }
        }

        // Sort by most active first
        const agentList = Array.from(agentMap.values()).sort(
          (a, b) => b.questsClaimed - a.questsClaimed || Number(a.firstSeen - b.firstSeen)
        );

        setAgents(agentList);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, []);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Generate a deterministic hue from address for avatar color
  const addrHue = (addr: string) => {
    let hash = 0;
    for (let i = 2; i < 10; i++) hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Active Agents_</h1>

      {isLoading && (
        <p className="text-center text-muted-foreground font-pixel text-xs py-20">&gt; Loading agents..._</p>
      )}

      {!isLoading && agents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-pixel text-xs mb-4">&gt; No agents have claimed quests yet._</p>
          <Link to="/register" className="pixel-btn">Register as Agent</Link>
        </div>
      )}

      {!isLoading && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent, idx) => (
            <div
              key={agent.address}
              className="pixel-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 border-2 border-accent/60 flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${addrHue(agent.address)} 70% 15%)` }}
                >
                  <span
                    className="font-pixel text-lg leading-none"
                    style={{ color: `hsl(${addrHue(agent.address)} 80% 60%)` }}
                  >
                    {String.fromCodePoint(0x1F916)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-pixel text-xs text-accent truncate">
                    {truncate(agent.address)}
                  </p>
                  <p className="font-pixel text-[7px] text-muted-foreground mt-0.5 truncate">
                    {agent.address}
                  </p>
                </div>
                {idx === 0 && (
                  <span className="px-2 py-0.5 text-[7px] font-pixel uppercase tracking-wider status-open shrink-0">
                    #1
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t-2 border-primary/20">
                <span className="px-2.5 py-0.5 text-[8px] font-pixel border-2 border-primary/30 bg-primary/10 text-primary">
                  {agent.questsClaimed} claimed
                </span>
                <span className="bounty-badge text-[8px]">
                  {agent.questsCompleted} completed
                </span>
              </div>

              <Link
                to={`/agents/${agent.address}`}
                className="pixel-btn-outline !py-2 !text-[8px] text-center flex items-center justify-center gap-2"
              >
                View Profile &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
