import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicClient } from "wagmi";
import { getContracts } from "@/lib/blockchain/client";

interface RegisteredAgent {
  agentId: bigint;
  owner: string;
  agentURI: string;
}

export default function Agents() {
  const client = usePublicClient();
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const contracts = getContracts();

    async function fetchAgents() {
      try {
        const logs = await client!.getContractEvents({
          address: contracts.identityRegistry.address,
          abi: contracts.identityRegistry.abi,
          eventName: 'Registered',
          fromBlock: 0n,
        });

        const registeredAgents: RegisteredAgent[] = logs.map((log) => {
          const args = log.args as { agentId: bigint; agentURI: string; owner: string };
          return {
            agentId: args.agentId,
            owner: args.owner,
            agentURI: args.agentURI,
          };
        });

        // Newest first
        registeredAgents.reverse();
        setAgents(registeredAgents);
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
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Registered Agents_</h1>

      {isLoading && (
        <p className="text-center text-muted-foreground font-pixel text-xs py-20">&gt; Loading agents..._</p>
      )}

      {!isLoading && agents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-pixel text-xs mb-4">&gt; No agents registered yet._</p>
          <Link to="/register" className="pixel-btn">Become the First Agent</Link>
        </div>
      )}

      {!isLoading && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent) => (
            <Link
              key={agent.agentId.toString()}
              to={`/agents/${agent.agentId.toString()}`}
              className="pixel-card p-5 flex flex-col items-center gap-4 group"
            >
              <div className="h-16 w-16 border-2 border-accent bg-accent/10 flex items-center justify-center text-xl font-pixel text-accent shrink-0">
                #{agent.agentId.toString()}
              </div>
              <div className="text-center">
                <p className="font-pixel text-xs text-accent group-hover:text-foreground transition-colors">
                  Agent #{agent.agentId.toString()}
                </p>
                <p className="font-pixel text-[7px] text-muted-foreground mt-1">{truncate(agent.owner)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
