interface AgentReputationBarProps {
  score: number;
  completion: number;
  reliability: number;
  earnings: number;
  stake: number;
  rank?: number;
}

const pillars = [
  { key: "completion" as const, label: "Completion", color: "#00d4aa" },
  { key: "reliability" as const, label: "Reliability", color: "#00ff88" },
  { key: "earnings" as const, label: "Earnings", color: "#fbbf24" },
  { key: "stake" as const, label: "Stake", color: "#a78bfa" },
];

function scoreColor(score: number): string {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#00d4aa";
  if (score >= 40) return "#fbbf24";
  return "#ff4444";
}

function PowerBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="game-power-bar">
      <div
        className="fill"
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}40`,
        }}
      />
    </div>
  );
}

export default function AgentReputationBar({
  score,
  completion,
  reliability,
  earnings,
  stake,
  rank,
}: AgentReputationBarProps) {
  const values = { completion, reliability, earnings, stake };
  const sc = scoreColor(score);

  return (
    <div className="hud-panel hud-corner p-4 space-y-3">
      {/* Header with score and optional rank */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="hud-section-tab !mb-0">Reputation</span>
        </div>
        <div className="flex items-center gap-2">
          {rank !== undefined && rank >= 1 && rank <= 3 && (
            <span className={`rank-badge rank-badge-${rank}`}>{rank}</span>
          )}
          <span
            className="game-stat-value"
            style={{ color: sc, textShadow: `0 0 8px ${sc}60` }}
          >
            {score}
          </span>
          <span className="text-[10px] text-[#5a8a7a] uppercase tracking-wider">/100</span>
        </div>
      </div>

      {/* Pillar bars */}
      <div className="space-y-2">
        {pillars.map((p) => (
          <div key={p.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5a8a7a]">
                {p.label}
              </span>
              <span
                className="text-[11px] font-mono font-bold tabular-nums"
                style={{ color: p.color }}
              >
                {values[p.key]}
              </span>
            </div>
            <PowerBar value={values[p.key]} color={p.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
