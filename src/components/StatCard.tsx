import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "cyan" | "green" | "amber" | "default";
}

const glowMap = {
  cyan: "cyber-card cyber-border-glow",
  green: "cyber-card hover:border-success/50 hover:shadow-[var(--glow-green)]",
  amber: "cyber-card hover:border-warning/50 hover:shadow-[var(--glow-amber)]",
  default: "cyber-card",
};

const iconColor = {
  cyan: "text-primary",
  green: "text-success",
  amber: "text-warning",
  default: "text-muted-foreground",
};

export default function StatCard({ label, value, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div className={`${glowMap[variant]} p-6 rounded-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${iconColor[variant]}`} />
      </div>
      <p className={`text-2xl font-mono font-bold ${iconColor[variant]} crt-text`}>{value}</p>
    </div>
  );
}
