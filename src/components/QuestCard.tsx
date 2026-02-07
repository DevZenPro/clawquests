import { Link } from "react-router-dom";
import type { Quest } from "@/lib/mock-data";
import StatusBadge from "./StatusBadge";
import { ArrowRight } from "lucide-react";

export default function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="cyber-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-muted-foreground">Quest #{quest.id}</span>
        <StatusBadge status={quest.status} />
      </div>
      <p className="text-sm text-foreground line-clamp-3 leading-relaxed flex-1">
        {quest.description}
      </p>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <span className="bounty-badge text-sm">{quest.bounty.toFixed(2)} USDC</span>
        <span className="text-xs font-mono text-muted-foreground">by {quest.poster}</span>
      </div>
      <Link to={`/quests/${quest.id}`} className="cyber-btn-outline !py-2 !text-xs text-center flex items-center justify-center gap-2">
        View Quest <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
