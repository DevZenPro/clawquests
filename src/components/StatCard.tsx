interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  variant?: "blue" | "orange" | "green" | "default";
}

const valueColor = {
  blue: "text-primary",
  orange: "text-warning",
  green: "text-success",
  default: "text-accent",
};

export default function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  return (
    <div className="pixel-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[7px] font-pixel uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xl" role="img">{icon}</span>
      </div>
      <p className={`text-sm font-pixel font-bold ${valueColor[variant]}`}>{value}</p>
    </div>
  );
}
