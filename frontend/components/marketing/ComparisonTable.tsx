import { COMPARISON_ROWS } from "@/lib/marketing/features";

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm font-medium text-foreground">{value}</span>;
  return value ? (
    <span className="text-brand-600" aria-label="Included">
      ✓
    </span>
  ) : (
    <span className="text-muted-foreground" aria-label="Not included">
      —
    </span>
  );
}

export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left">
            <th className="px-4 py-3 font-semibold text-foreground">Feature</th>
            <th className="px-4 py-3 font-semibold text-foreground">Free</th>
            <th className="px-4 py-3 font-semibold text-brand-700 dark:text-brand-400">Prime</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-muted-foreground">{row.feature}</td>
              <td className="px-4 py-3">
                <Cell value={row.free} />
              </td>
              <td className="px-4 py-3">
                <Cell value={row.prime} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
