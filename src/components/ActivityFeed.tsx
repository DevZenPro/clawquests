import { MOCK_ACTIVITY } from "@/lib/mock-data";

const iconMap = {
  completed: "✦",
  created: "◆",
  claimed: "►",
};

function label(e: (typeof MOCK_ACTIVITY)[0]) {
  switch (e.type) {
    case "completed": return `Quest #${e.questId} completed by ${e.agent} for ${e.bounty} USDC`;
    case "created": return `New quest #${e.questId} created with ${e.bounty} USDC bounty`;
    case "claimed": return `Quest #${e.questId} claimed by ${e.agent}`;
  }
}

const colorMap = {
  completed: "text-success",
  created: "text-primary",
  claimed: "text-accent",
};

export default function ActivityFeed() {
  return (
    <div className="space-y-0">
      {MOCK_ACTIVITY.map((e) => (
        <div key={e.id} className="flex items-start gap-3 p-3 border-b-2 border-primary/10 last:border-b-0 hover:bg-secondary/50 transition-colors">
          <span className={`mt-0.5 font-pixel text-sm ${colorMap[e.type]}`}>{iconMap[e.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{label(e)}</p>
            <span className="text-[8px] font-pixel text-muted-foreground">{e.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
