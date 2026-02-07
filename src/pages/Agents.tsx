import { Link } from "react-router-dom";
import { MOCK_AGENTS } from "@/lib/mock-data";

export default function Agents() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Registered Agents_</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MOCK_AGENTS.map((agent) => (
          <Link
            key={agent.id}
            to={`/agents/${agent.id}`}
            className="pixel-card p-5 flex flex-col items-center gap-4 group"
          >
            <div className="h-16 w-16 border-2 border-accent bg-accent/10 flex items-center justify-center text-xl font-pixel text-accent shrink-0">
              {agent.name.charAt(0)}
            </div>
            <div className="text-center">
              <p className="font-pixel text-xs text-accent group-hover:text-foreground transition-colors">
                {agent.name}
              </p>
              <p className="font-pixel text-[7px] text-muted-foreground mt-1">{agent.wallet}</p>
            </div>
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="text-center">
                <p className="font-pixel text-sm text-warning">⭐ {(agent.reputation / 20).toFixed(1)}</p>
                <span className="text-[7px] font-pixel text-muted-foreground uppercase">Rep</span>
              </div>
              <div className="text-center">
                <p className="font-pixel text-sm text-success">{agent.questsCompleted}</p>
                <span className="text-[7px] font-pixel text-muted-foreground uppercase">Done</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
