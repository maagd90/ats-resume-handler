"use client";

type GuidanceItem = {
  field: string;
  steps?: string[];
  guidance_steps?: string[];
  tip?: string;
  guidance_tip?: string;
  copy_text?: string;
};

type FieldChange = {
  field: string;
  section: string;
  before: string;
  after: string;
  guidance_steps?: string[];
  guidance_tip?: string;
};

export default function GuidancePanel({
  changes,
  guidance,
  headlineVariants,
  skillsToAdd,
  warnings,
  quota,
}: {
  changes: FieldChange[];
  guidance: GuidanceItem[];
  headlineVariants: string[];
  skillsToAdd: string[];
  warnings: string[];
  quota?: { used: number; limit: number; tier: string };
}) {
  const linkedinChanges = changes.filter((c) => c.section === "linkedin");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <h3 className="font-semibold text-brand-800">How to update LinkedIn</h3>
        <p className="mt-1 text-sm text-brand-700">
          Copy each section below and paste it into LinkedIn manually. We cannot edit your profile directly.
        </p>
        {quota && (
          <p className="mt-2 text-xs text-brand-600">
            Optimizations: {quota.used}/{quota.limit} this month ({quota.tier})
          </p>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">Validation notes</p>
          <ul className="mt-1 list-disc pl-4">
            {warnings.slice(0, 5).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.map((item, idx) => (
        <GuidanceCard key={`g-${idx}`} item={item} />
      ))}

      {linkedinChanges.map((change) => (
        <div key={change.field} className="card">
          <p className="text-xs font-semibold uppercase text-slate-500">{change.field}</p>
          {change.guidance_steps && (
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
              {change.guidance_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {change.guidance_tip && (
            <p className="mt-2 text-xs text-brand-600">Tip: {change.guidance_tip}</p>
          )}
          <CopyBlock label={change.field} text={change.after} />
        </div>
      ))}

      {headlineVariants.length > 1 && (
        <div className="card">
          <p className="font-medium text-slate-800">Alternative headlines</p>
          {headlineVariants.slice(1).map((h, i) => (
            <CopyBlock key={i} label={`Option ${i + 2}`} text={h} />
          ))}
        </div>
      )}

      {skillsToAdd.length > 0 && (
        <div className="card">
          <p className="font-medium text-slate-800">Skills to add on LinkedIn</p>
          <p className="mt-2 text-sm text-slate-600">{skillsToAdd.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

function GuidanceCard({ item }: { item: GuidanceItem }) {
  const steps = item.steps || item.guidance_steps || [];
  return (
    <div className="card">
      <p className="font-medium capitalize text-slate-800">{item.field}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {(item.tip || item.guidance_tip) && (
        <p className="mt-2 text-xs text-brand-600">Tip: {item.tip || item.guidance_tip}</p>
      )}
      {item.copy_text && <CopyBlock label={item.field} text={item.copy_text} />}
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  async function copy() {
    await navigator.clipboard.writeText(text);
  }
  return (
    <div className="mt-3 rounded-lg bg-slate-50 p-3">
      <p className="whitespace-pre-wrap text-sm text-slate-700">{text}</p>
      <button onClick={copy} className="btn-secondary mt-2 text-xs">
        Copy {label}
      </button>
    </div>
  );
}
