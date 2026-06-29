type Issue = {
  category: string;
  severity: string;
  message: string;
  suggestion?: string;
};

export default function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) {
    return <p className="text-sm text-muted-foreground">No issues found. Great job!</p>;
  }

  const badgeClass = (severity: string) => {
    if (severity === "high") return "badge-high";
    if (severity === "medium") return "badge-medium";
    return "badge-low";
  };

  return (
    <ul className="space-y-3">
      {issues.map((issue, index) => (
        <li key={`${issue.category}-${index}`} className="rounded-lg border border-border bg-surface-muted p-4">
          <div className="flex items-center gap-2">
            <span className={badgeClass(issue.severity)}>{issue.severity}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{issue.category}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{issue.message}</p>
          {issue.suggestion && <p className="mt-1 text-sm text-muted-foreground">{issue.suggestion}</p>}
        </li>
      ))}
    </ul>
  );
}
