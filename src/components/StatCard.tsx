interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  variant?: "blue" | "orange" | "green" | "default";
}

const borderHover = {
  blue: "hover:border-primary",
  orange: "hover:border-accent",
  green: "hover:border-success",
  default: "hover:border-accent",
};

const valueColor = {
  blue: "text-primary",
  orange: "text-accent",
  green: "text-success",
  default: "text-foreground",
};

export default function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  return (
    <div className={`pixel-card p-5 ${borderHover[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-2xl" role="img">{icon}</span>
      </div>
      <p className={`text-lg font-pixel font-bold ${valueColor[variant]}`}>{value}</p>
    </div>
  );
}
