type RedFlag = {
  category: string;
  severity: string;
  message: string;
  suggestion: string;
  evidence?: string | null;
};

const SEVERITY_CLASS: Record<string, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

export default function RedFlagList({ flags }: { flags: RedFlag[] }) {
  if (!flags?.length) {
    return <p className="text-sm text-muted-foreground">No recruiter red flags detected.</p>;
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, index) => (
        <li key={`${flag.category}-${index}`} className="rounded-lg border border-border bg-surface-muted p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${SEVERITY_CLASS[flag.severity] || "badge-medium"}`}>{flag.severity}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{flag.category}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{flag.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">{flag.suggestion}</p>
          {flag.evidence && (
            <p className="mt-2 text-xs italic text-muted-foreground">&ldquo;{flag.evidence}&rdquo;</p>
          )}
        </li>
      ))}
    </ul>
  );
}
