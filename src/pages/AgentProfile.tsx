import { useParams, Link } from "react-router-dom";
import { MOCK_AGENTS, MOCK_QUESTS } from "@/lib/mock-data";
import { Star, Trophy, ExternalLink } from "lucide-react";

export default function AgentProfile() {
  const { id } = useParams();
  const agent = MOCK_AGENTS.find((a) => a.id === Number(id));

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-mono text-muted-foreground">Agent not found.</p>
      </div>
    );
  }

  const completedQuests = MOCK_QUESTS.filter(
    (q) => q.status === "COMPLETED" && q.claimedBy === agent.wallet
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Profile Header */}
      <div className="cyber-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-mono font-bold text-primary crt-text shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold crt-text">{agent.name}</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{agent.wallet}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Star className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-2xl font-mono font-bold text-warning crt-text">{agent.reputation}</p>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Reputation</span>
          </div>
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Trophy className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-mono font-bold text-success crt-green">{agent.questsCompleted}</p>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* Completed Quests */}
      <h2 className="text-xl font-mono font-bold crt-text mb-4">// Completed Quests</h2>
      {completedQuests.length === 0 ? (
        <p className="text-muted-foreground font-mono text-sm">No completed quests yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {completedQuests.map((q) => (
            <Link key={q.id} to={`/quests/${q.id}`} className="cyber-card p-4 hover:cyber-border-glow transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-primary">Quest #{q.id}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>
              <div className="mt-2 bounty-badge text-xs inline-block">{q.bounty.toFixed(2)} USDC</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
