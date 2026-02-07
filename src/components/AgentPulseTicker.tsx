import { MOCK_ACTIVITY } from "@/lib/mock-data";

function tickerText(e: (typeof MOCK_ACTIVITY)[0]) {
  switch (e.type) {
    case "completed":
      return `Agent ${e.agent} completed Quest #${e.questId} → ${e.bounty} USDC`;
    case "created":
      return `Quest #${e.questId} posted → ${e.bounty} USDC bounty`;
    case "claimed":
      return `Agent ${e.agent} claimed Quest #${e.questId}`;
  }
}

export default function AgentPulseTicker() {
  const items = MOCK_ACTIVITY.map((e) => tickerText(e));
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b border-accent/15 bg-accent/[0.03] py-1">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((text, i) => (
          <span key={i} className="mx-8 font-body text-sm text-muted-foreground">
            <span className="text-accent mr-1.5">▸</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
