import { useEffect, useRef, useState } from "react";

interface StatItem {
  label: string;
  value: string;
  accent?: boolean;
}

interface StatsBarProps {
  stats: StatItem[];
}

interface StatDelta {
  direction: "up" | "down";
  timestamp: number;
}

const DELTA_VISIBLE_MS = 8_000;

export default function StatsBar({ stats }: StatsBarProps) {
  const prevRef = useRef<string[]>([]);
  const [deltas, setDeltas] = useState<Record<number, StatDelta>>({});

  useEffect(() => {
    const prev = prevRef.current;
    if (prev.length > 0) {
      const now = Date.now();
      const newDeltas: Record<number, StatDelta> = {};
      stats.forEach((s, i) => {
        if (prev[i] && prev[i] !== s.value) {
          const prevNum = parseFloat(prev[i].replace(/[^0-9.-]/g, ""));
          const currNum = parseFloat(s.value.replace(/[^0-9.-]/g, ""));
          if (!isNaN(prevNum) && !isNaN(currNum)) {
            newDeltas[i] = { direction: currNum >= prevNum ? "up" : "down", timestamp: now };
          }
        }
      });
      if (Object.keys(newDeltas).length > 0) setDeltas(newDeltas);
    }
    prevRef.current = stats.map((s) => s.value);
  }, [stats]);

  useEffect(() => {
    if (Object.keys(deltas).length === 0) return;
    const timer = setTimeout(() => setDeltas({}), DELTA_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [deltas]);

  return (
    <div className="hud-panel hud-corner font-mono">
      {/* LIVE beacon bar */}
      <div className="flex items-center h-8 px-4 border-b border-[#0e2420]">
        <div className="flex items-center gap-2">
          <span
            className="w-[7px] h-[7px] rounded-full bg-[#00ff88] status-pulse"
            style={{ boxShadow: "0 0 6px rgba(0,255,136,0.6)" }}
          />
          <span
            className="text-[11px] text-[#00ff88] tracking-[0.2em] font-bold"
            style={{ textShadow: "0 0 6px rgba(0,255,136,0.3)" }}
          >
            LIVE
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-[#5a8a7a] opacity-40 uppercase tracking-[0.15em]">
          ClawQuests Network
        </span>
      </div>

      {/* Stats row */}
      <div className="flex md:grid md:grid-cols-4 md:divide-x divide-[#0e2420] overflow-x-auto">
        {stats.map((s, i) => {
          const delta = deltas[i];
          const isUp = delta?.direction === "up";
          return (
            <div key={s.label} className="flex flex-col items-center justify-center py-3 shrink-0 px-4 md:px-0">
              <span
                className={`text-[18px] md:text-[24px] leading-none tabular-nums font-bold ${
                  s.accent ? "text-[#00d4aa]" : "text-gray-200"
                }`}
                style={s.accent ? { textShadow: "0 0 8px rgba(0,212,170,0.3)" } : undefined}
              >
                {s.value}
                {delta && (
                  <span
                    className={`text-[14px] ml-1 ${isUp ? "text-[#00ff88]" : "text-[#ff4444]"}`}
                    style={{
                      textShadow: `0 0 4px ${isUp ? "rgba(0,255,136,0.4)" : "rgba(255,68,68,0.4)"}`,
                    }}
                  >
                    {isUp ? "↑" : "↓"}
                  </span>
                )}
              </span>
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#5a8a7a] opacity-40 mt-1.5">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
