import { MOCK_ACTIVITY } from "@/lib/mock-data";
import { CheckCircle2, PlusCircle, Hand } from "lucide-react";

const iconMap = {
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  created: <PlusCircle className="h-4 w-4 text-primary" />,
  claimed: <Hand className="h-4 w-4 text-warning" />,
};

function label(e: (typeof MOCK_ACTIVITY)[0]) {
  switch (e.type) {
    case "completed": return `Quest #${e.questId} completed by ${e.agent} for ${e.bounty} USDC`;
    case "created": return `New quest #${e.questId} created with ${e.bounty} USDC bounty`;
    case "claimed": return `Quest #${e.questId} claimed by ${e.agent}`;
  }
}

export default function ActivityFeed() {
  return (
    <div className="space-y-1">
      {MOCK_ACTIVITY.map((e) => (
        <div key={e.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors">
          <div className="mt-0.5">{iconMap[e.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{label(e)}</p>
            <span className="text-xs font-mono text-muted-foreground">{e.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
