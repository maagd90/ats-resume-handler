import ScoreRing from "@/components/ScoreRing";

type ScoreBreakdownProps = {
  score: {
    overall: number;
    parseability?: number;
    structure?: number;
    keywords: number;
    impact: number;
    recruiter_appeal?: number;
  };
  compact?: boolean;
};

export default function ScoreBreakdown({ score, compact = false }: ScoreBreakdownProps) {
  const ringSize = compact ? 72 : 80;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-around gap-4">
        <ScoreRing label="Overall" value={score.overall} size={compact ? 100 : 110} />
        {typeof score.parseability === "number" && (
          <ScoreRing label="Parseability" value={score.parseability} size={ringSize} />
        )}
        {typeof score.structure === "number" && (
          <ScoreRing label="Structure" value={score.structure} size={ringSize} />
        )}
        <ScoreRing label="Keywords" value={score.keywords} size={ringSize} />
        <ScoreRing label="Impact" value={score.impact} size={ringSize} />
        {typeof score.recruiter_appeal === "number" && (
          <ScoreRing label="Recruiter appeal" value={score.recruiter_appeal} size={ringSize} />
        )}
      </div>
    </div>
  );
}
