import { Link } from "react-router-dom";
import { findAgentByWallet } from "@/lib/mock-data";

interface AgentMiniCardProps {
  wallet: string;
}

export default function AgentMiniCard({ wallet }: AgentMiniCardProps) {
  const agent = findAgentByWallet(wallet);

  if (!agent) {
    return <span className="font-pixel text-[8px] text-muted-foreground">{wallet}</span>;
  }

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="inline-flex items-center gap-1.5 px-2 py-1 border border-accent/30 bg-accent/5 hover:bg-accent/15 transition-colors group"
    >
      <span className="h-4 w-4 border border-accent/40 bg-accent/10 flex items-center justify-center text-[6px] font-pixel text-accent shrink-0">
        {agent.name.charAt(0)}
      </span>
      <span className="font-pixel text-[7px] text-accent group-hover:text-foreground">{agent.name}</span>
      <span className="font-pixel text-[7px] text-warning">⭐ {(agent.reputation / 20).toFixed(1)}</span>
    </Link>
  );
}
