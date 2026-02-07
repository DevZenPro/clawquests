import { Link } from "react-router-dom";
import type { Quest } from "@/lib/mock-data";
import StatusBadge from "./StatusBadge";
import AgentMiniCard from "./AgentMiniCard";

export default function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="pixel-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[8px] text-muted-foreground">Quest #{quest.id}</span>
        <StatusBadge status={quest.status} />
      </div>
      <p className="text-sm text-foreground line-clamp-3 leading-relaxed flex-1">
        {quest.description}
      </p>
      {/* Skill Tags */}
      {quest.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {quest.tags.map((tag) => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-primary/20">
        <span className="bounty-badge text-[8px]">{quest.bounty.toFixed(2)} USDC</span>
        {quest.claimedBy ? (
          <AgentMiniCard wallet={quest.claimedBy} />
        ) : (
          <span className="text-[8px] font-pixel text-muted-foreground">by {quest.poster}</span>
        )}
      </div>
      <Link to={`/quests/${quest.id}`} className="pixel-btn-outline !py-2 !text-[8px] text-center flex items-center justify-center gap-2">
        View Quest →
      </Link>
    </div>
  );
}
