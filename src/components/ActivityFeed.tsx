import { MOCK_ACTIVITY } from "@/lib/mock-data";

const iconMap = {
  completed: "✦",
  created: "◆",
  claimed: "►",
};

function label(e: (typeof MOCK_ACTIVITY)[0]) {
  switch (e.type) {
    case "completed": return `Quest #${e.questId} completed by ${e.agent} → ${e.bounty} USDC`;
    case "created": return `New quest #${e.questId} created → ${e.bounty} USDC bounty`;
    case "claimed": return `Quest #${e.questId} claimed by ${e.agent}`;
  }
}

const colorMap = {
  completed: "text-success",
  created: "text-accent",
  claimed: "text-warning",
};

export default function ActivityFeed() {
  return (
    <div className="space-y-0">
      {MOCK_ACTIVITY.map((e) => (
        <div key={e.id} className="flex items-start gap-3 p-3 border-b border-primary/10 last:border-b-0 hover:bg-accent/[0.03] transition-colors">
          <span className={`mt-0.5 font-pixel text-xs ${colorMap[e.type]}`}>{iconMap[e.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base text-foreground/85">{label(e)}</p>
            <span className="text-xs font-body text-muted-foreground">{e.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
