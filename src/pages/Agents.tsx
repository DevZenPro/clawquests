import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicClient } from "wagmi";
import { getContracts, getDeployBlock, DEFAULT_CHAIN_ID } from "@/lib/blockchain/client";

interface AgentInfo {
  address: string;
  questsClaimed: number;
  questsCompleted: number;
  firstSeen: bigint;
}

export default function Agents() {
  const client = usePublicClient();
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const contracts = getContracts();
    const fromBlock = getDeployBlock(DEFAULT_CHAIN_ID);

    async function fetchAgents() {
      try {
        const [claimedLogs, completedLogs] = await Promise.all([
          client!.getContractEvents({
            address: contracts.clawQuests.address,
            abi: contracts.clawQuests.abi,
            eventName: 'QuestClaimed',
            fromBlock,
          }),
          client!.getContractEvents({
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
  }, [client]);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent) => (
            <Link
              key={agent.address}
              to={`/agents/${agent.address}`}
              className="pixel-card p-5 flex flex-col items-center gap-4 group"
            >
              <div className="h-16 w-16 border-2 border-accent bg-accent/10 flex items-center justify-center text-sm font-pixel text-accent shrink-0">
                {truncate(agent.address)}
              </div>
              <div className="text-center">
                <p className="font-pixel text-xs text-accent group-hover:text-foreground transition-colors">
                  {truncate(agent.address)}
                </p>
                <p className="font-pixel text-[7px] text-muted-foreground mt-1">
                  {agent.questsClaimed} claimed · {agent.questsCompleted} completed
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
