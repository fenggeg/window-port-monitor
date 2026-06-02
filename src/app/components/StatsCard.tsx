interface StatsCardProps {
  label: string;
  value: number;
  color?: string;
}

export function StatsCard({ label, value, color = "text-foreground" }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold font-mono ${color}`}>{value}</div>
    </div>
  );
}