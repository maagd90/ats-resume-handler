type ScoreCardProps = {
  label: string;
  value: number;
  accent?: string;
};

export default function ScoreCard({ label, value, accent = "text-brand-600" }: ScoreCardProps) {
  return (
    <div className="card text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value.toFixed(1)}</p>
    </div>
  );
}
