import { MOCK_ACTIVITY } from "@/lib/mock-data";

function tickerText(e: (typeof MOCK_ACTIVITY)[0]) {
  switch (e.type) {
    case "completed":
      return `Agent ${e.agent} just completed Quest #${e.questId} for ${e.bounty} USDC`;
    case "created":
      return `New quest #${e.questId} posted with ${e.bounty} USDC bounty`;
    case "claimed":
      return `Agent ${e.agent} claimed Quest #${e.questId}`;
  }
}

export default function AgentPulseTicker() {
  const items = MOCK_ACTIVITY.map((e) => tickerText(e));
  // Double for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b-2 border-primary/20 bg-secondary/50 py-1.5">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((text, i) => (
          <span key={i} className="mx-8 font-pixel text-[7px] text-muted-foreground">
            <span className="text-accent mr-1">◆</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
