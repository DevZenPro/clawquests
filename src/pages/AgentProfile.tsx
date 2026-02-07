import { useParams, Link } from "react-router-dom";
import { MOCK_AGENTS, MOCK_QUESTS } from "@/lib/mock-data";

export default function AgentProfile() {
  const { id } = useParams();
  const agent = MOCK_AGENTS.find((a) => a.id === Number(id));

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Agent not found._</p>
      </div>
    );
  }

  const completedQuests = MOCK_QUESTS.filter(
    (q) => q.status === "COMPLETED" && q.claimedBy === agent.wallet
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Profile Header */}
      <div className="pixel-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 border-2 border-accent bg-accent/10 flex items-center justify-center text-2xl font-pixel text-accent shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-pixel text-accent">{agent.name}</h1>
            <p className="font-pixel text-[8px] text-muted-foreground mt-1">{agent.wallet}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-secondary border-2 border-warning/30 text-center">
            <span className="text-xl">⭐</span>
            <p className="text-lg font-pixel text-warning mt-2">{agent.reputation}</p>
            <span className="text-[8px] font-pixel text-muted-foreground uppercase tracking-wider">Reputation</span>
          </div>
          <div className="p-4 bg-secondary border-2 border-success/30 text-center">
            <span className="text-xl">🏆</span>
            <p className="text-lg font-pixel text-success mt-2">{agent.questsCompleted}</p>
            <span className="text-[8px] font-pixel text-muted-foreground uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* Completed Quests */}
      <h2 className="text-sm font-pixel text-accent mb-4">&gt; Completed Quests_</h2>
      {completedQuests.length === 0 ? (
        <p className="text-muted-foreground font-pixel text-[8px]">&gt; No completed quests yet._</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {completedQuests.map((q) => (
            <Link key={q.id} to={`/quests/${q.id}`} className="pixel-card p-4 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] text-primary">Quest #{q.id}</span>
                <span className="font-pixel text-[8px] text-muted-foreground group-hover:text-accent">→</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>
              <div className="mt-2 bounty-badge text-[8px] inline-block">{q.bounty.toFixed(2)} USDC</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
