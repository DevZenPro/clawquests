import { Link } from "react-router-dom";
import { findAgentByWallet } from "@/lib/mock-data";

interface AgentMiniCardProps {
  wallet: string;
}

export default function AgentMiniCard({ wallet }: AgentMiniCardProps) {
  const agent = findAgentByWallet(wallet);

  if (!agent) {
    return <span className="font-pixel text-[7px] text-muted-foreground">{wallet}</span>;
  }

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="inline-flex items-center gap-1.5 px-2 py-1 border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-all group"
    >
      <span className="h-4 w-4 border border-warning/40 bg-warning/10 flex items-center justify-center text-[6px] font-pixel text-warning shrink-0">
        {agent.name.charAt(0)}
      </span>
      <span className="font-body text-sm text-warning/90 group-hover:text-warning">{agent.name}</span>
      <span className="font-body text-sm text-success/80">⭐{(agent.reputation / 20).toFixed(1)}</span>
    </Link>
  );
}
