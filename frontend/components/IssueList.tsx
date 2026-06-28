type Issue = {
  category: string;
  severity: string;
  message: string;
  suggestion?: string;
};

export default function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) {
    return <p className="text-sm text-slate-500">No issues found. Great job!</p>;
  }

  const badgeClass = (severity: string) => {
    if (severity === "high") return "badge-high";
    if (severity === "medium") return "badge-medium";
    return "badge-low";
  };

  return (
    <ul className="space-y-3">
      {issues.map((issue, index) => (
        <li key={`${issue.category}-${index}`} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <span className={badgeClass(issue.severity)}>{issue.severity}</span>
            <span className="text-xs uppercase tracking-wide text-slate-400">{issue.category}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-800">{issue.message}</p>
          {issue.suggestion && <p className="mt-1 text-sm text-slate-600">{issue.suggestion}</p>}
        </li>
      ))}
    </ul>
  );
}
