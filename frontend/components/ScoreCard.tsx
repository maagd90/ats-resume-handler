type ScoreCardProps = {
  label: string;
  value: number;
  accent?: string;
};

export default function ScoreCard({ label, value, accent = "text-brand-600" }: ScoreCardProps) {
  return (
    <div className="card-elevated text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{typeof value === "number" ? value.toFixed(0) : value}</p>
    </div>
  );
}
