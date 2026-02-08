import { type QuestEvent, formatEventLabel } from "@/hooks/useQuestEvents";

interface AgentPulseTickerProps {
  events: QuestEvent[];
}

export default function AgentPulseTicker({ events }: AgentPulseTickerProps) {
  if (events.length === 0) {
    return (
      <div className="w-full overflow-hidden border-b-2 border-primary/20 bg-secondary/50 py-1.5">
        <div className="flex whitespace-nowrap justify-center">
          <span className="mx-8 font-pixel text-[7px] text-muted-foreground">
            <span className="text-accent mr-1">◆</span>
            Waiting for quest activity...
          </span>
        </div>
      </div>
    );
  }

  const items = events.map((e) => formatEventLabel(e));
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
