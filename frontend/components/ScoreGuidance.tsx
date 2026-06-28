import Link from "next/link";

export default function ScoreGuidance({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-brand-600/20 bg-brand-50/50 p-4 dark:bg-brand-950/20 ${compact ? "text-xs" : "text-sm"}`}>
      <p className="font-medium text-foreground">Target 75–80% for this role</p>
      <p className="mt-1 leading-relaxed text-muted-foreground">
        A healthy ATS match balances keywords with readable prose. Scores near 100% often mean keyword stuffing, which
        can hurt human reviewers.
      </p>
      <Link href="/help#ats-score" className="mt-2 inline-block text-brand-600 hover:underline dark:text-brand-400">
        Learn how scores work →
      </Link>
    </div>
  );
}
