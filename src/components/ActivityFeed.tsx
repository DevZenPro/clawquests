import { type QuestEvent, formatEventLabel } from "@/hooks/useQuestEvents";

const iconMap = {
  completed: "✦",
  created: "◆",
  claimed: "►",
};

const colorMap = {
  completed: "text-success",
  created: "text-primary",
  claimed: "text-accent",
};

interface ActivityFeedProps {
  events: QuestEvent[];
  isLoading: boolean;
}

export default function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="font-pixel text-[8px] text-muted-foreground">&gt; Loading activity..._</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="font-pixel text-[8px] text-muted-foreground">&gt; No activity yet. Be the first to create a quest!_</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 hud-console">
      {events.map((e, i) => (
        <div key={`${e.type}-${e.questId}-${i}`} className="flex items-start gap-3 p-3 border-b-2 border-primary/10 last:border-b-0 hover:bg-secondary/50 transition-colors">
          <span className={`mt-0.5 font-pixel text-sm ${colorMap[e.type]}`}>{iconMap[e.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{formatEventLabel(e)}</p>
            <span className="text-[8px] font-pixel text-muted-foreground">Block #{e.blockNumber.toString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
