import Link from "next/link";

type ChecklistItem = {
  dimension: string;
  score: number;
  tip: string;
};

export default function RecruiterAppealPanel({
  score,
  checklist,
  feedback,
}: {
  score?: number;
  checklist?: ChecklistItem[];
  feedback?: string | null;
}) {
  if (score == null && !feedback && !checklist?.length) return null;

  return (
    <section className="card space-y-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recruiter appeal</h2>
        {typeof score === "number" && (
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{score.toFixed(0)}%</span>
        )}
      </div>
      {feedback && (
        <p className="text-sm leading-relaxed text-foreground">{feedback}</p>
      )}
      {checklist && checklist.length > 0 && (
        <ul className="space-y-2 text-sm">
          {checklist.map((item) => (
            <li key={item.dimension} className="flex items-start justify-between gap-3 rounded-lg bg-surface-muted p-3">
              <div>
                <p className="font-medium capitalize text-foreground">{item.dimension.replace(/_/g, " ")}</p>
                <p className="mt-0.5 text-muted-foreground">{item.tip}</p>
              </div>
              <span className="shrink-0 font-semibold text-foreground">{item.score}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/help#recruiter-appeal" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
        How recruiter appeal is scored →
      </Link>
    </section>
  );
}
