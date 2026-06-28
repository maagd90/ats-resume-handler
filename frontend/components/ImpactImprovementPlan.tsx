type FlaggedBullet = {
  role: string;
  current: string;
  fix: string;
};

type ChecklistItem = {
  priority: string;
  title: string;
  detail: string;
  action: string;
  examples?: string[];
  flagged_bullets?: FlaggedBullet[];
};

type ImpactPlan = {
  current_score: number;
  target_score: number;
  projected_score: number;
  checklist: ChecklistItem[];
  stats?: {
    total_bullets: number;
    quantified_bullets: number;
    quantified_ratio: number;
    action_verb_ratio: number;
    summary_word_count: number;
  };
};

export default function ImpactImprovementPlan({ plan }: { plan: ImpactPlan }) {
  if (!plan?.checklist?.length) {
    return (
      <p className="text-sm text-emerald-700">
        Your impact score is strong. No major improvements needed to reach 100%.
      </p>
    );
  }

  const badgeClass = (priority: string) => {
    if (priority === "high") return "badge-high";
    if (priority === "medium") return "badge-medium";
    return "badge-low";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>
          Impact: <strong>{plan.current_score}</strong> → target <strong>{plan.target_score}</strong>
        </span>
        {plan.projected_score > plan.current_score && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            Up to +{Math.round(plan.projected_score - plan.current_score)} pts if you apply the steps below
          </span>
        )}
      </div>

      {plan.stats && (
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
          <div>Bullets: {plan.stats.total_bullets}</div>
          <div>With metrics: {plan.stats.quantified_bullets} ({plan.stats.quantified_ratio}%)</div>
          <div>Action verbs: {plan.stats.action_verb_ratio}%</div>
          <div>Summary words: {plan.stats.summary_word_count}</div>
        </div>
      )}

      <ol className="space-y-4">
        {plan.checklist.map((item, index) => (
          <li key={item.title} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Step {index + 1}</span>
              <span className={badgeClass(item.priority)}>{item.priority}</span>
            </div>
            <h3 className="mt-2 font-medium text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{item.action}</p>

            {item.examples && item.examples.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {item.examples.map((example) => (
                  <li key={example} className="rounded bg-slate-50 px-2 py-1">
                    {example}
                  </li>
                ))}
              </ul>
            )}

            {item.flagged_bullets && item.flagged_bullets.length > 0 && (
              <div className="mt-3 space-y-2">
                {item.flagged_bullets.map((bullet) => (
                  <div key={`${bullet.role}-${bullet.current.slice(0, 40)}`} className="rounded border border-amber-100 bg-amber-50 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-amber-700">{bullet.role}</p>
                    <p className="mt-1 text-slate-700">
                      <span className="font-medium">Current:</span> {bullet.current}
                    </p>
                    <p className="mt-1 text-slate-800">
                      <span className="font-medium">Suggested:</span> {bullet.fix}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
