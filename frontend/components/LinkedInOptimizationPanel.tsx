"use client";

type AnalysisNotes = Record<string, string>;

type ExperienceUpgrade = {
  role?: string;
  upgraded_bullets?: string;
};

export default function LinkedInOptimizationPanel({
  analysis,
  guidance,
  headlineVariants,
  skillsToAdd,
  experienceUpgrades,
  optimizedAbout,
  warnings,
  extractedPreview,
}: {
  analysis?: AnalysisNotes;
  guidance?: Array<{ field: string; steps?: string[]; tip?: string; copy_text?: string }>;
  headlineVariants?: string[];
  skillsToAdd?: string[];
  experienceUpgrades?: ExperienceUpgrade[];
  optimizedAbout?: string;
  warnings?: string[];
  extractedPreview?: string;
}) {
  const checklist = buildChecklist(analysis, headlineVariants, skillsToAdd, experienceUpgrades, optimizedAbout);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-brand-600/20 bg-brand-50 p-4 dark:bg-brand-950/30">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-brand-300">What to optimize</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Apply these changes manually on LinkedIn — we show exactly what to update and suggested copy.
        </p>
      </div>

      {checklist.length > 0 ? (
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="card border-l-4 border-l-brand-600 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className={`badge shrink-0 ${priorityClass(item.priority)}`}>{item.priority}</span>
              </div>
              {item.suggested && (
                <div className="mt-3 rounded-lg bg-surface-muted p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Suggested</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-200">{item.suggested}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No specific issues detected — review guidance below.</p>
      )}

      {guidance && guidance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Step-by-step</h3>
          {guidance.map((g, i) => (
            <div key={i} className="card p-4">
              <p className="font-medium capitalize text-gray-900 dark:text-white">{g.field}</p>
              {g.steps && (
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                  {g.steps.map((step, j) => (
                    <li key={j}>{step}</li>
                  ))}
                </ol>
              )}
              {g.tip && <p className="mt-2 text-xs text-brand-700 dark:text-brand-400">Tip: {g.tip}</p>}
              {g.copy_text && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-muted p-3 text-xs">{g.copy_text}</pre>
              )}
            </div>
          ))}
        </div>
      )}

      {experienceUpgrades && experienceUpgrades.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white">Experience bullets to refresh</h3>
          <div className="mt-3 space-y-4">
            {experienceUpgrades.map((exp, i) => (
              <div key={i} className="rounded-lg bg-surface-muted p-3">
                <p className="text-sm font-medium">{exp.role || `Role ${i + 1}`}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{exp.upgraded_bullets}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Notes</p>
          <ul className="mt-1 list-disc pl-4">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {extractedPreview && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium">Extracted from PDF (preview)</summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface-muted p-3 text-xs">{extractedPreview}</pre>
        </details>
      )}
    </div>
  );
}

type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
  suggested?: string;
};

function buildChecklist(
  analysis?: AnalysisNotes,
  headlineVariants?: string[],
  skillsToAdd?: string[],
  experienceUpgrades?: ExperienceUpgrade[],
  optimizedAbout?: string,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (analysis) {
    for (const [key, note] of Object.entries(analysis)) {
      if (!note?.trim()) continue;
      items.push({
        id: `analysis-${key}`,
        title: formatField(key),
        detail: note,
        priority: key === "headline" ? "High" : "Medium",
        suggested: key === "headline" ? headlineVariants?.[0] : key === "about" ? optimizedAbout : undefined,
      });
    }
  }

  if (headlineVariants?.length && !items.some((i) => i.id.includes("headline"))) {
    items.unshift({
      id: "headline",
      title: "Headline",
      detail: "Your headline should lead with role + value for ATS and recruiter search.",
      priority: "High",
      suggested: headlineVariants[0],
    });
  }

  if (optimizedAbout && !items.some((i) => i.id.includes("about"))) {
    items.push({
      id: "about",
      title: "About section",
      detail: "Rewrite About with keywords and measurable impact from your resume.",
      priority: "High",
      suggested: optimizedAbout,
    });
  }

  if (skillsToAdd?.length) {
    items.push({
      id: "skills",
      title: "Skills",
      detail: `Add or pin these skills from your resume: ${skillsToAdd.join(", ")}`,
      priority: "Medium",
    });
  }

  if (experienceUpgrades?.length) {
    items.push({
      id: "experience",
      title: "Experience descriptions",
      detail: `${experienceUpgrades.length} role(s) have stronger bullet suggestions below.`,
      priority: "Medium",
    });
  }

  return items;
}

function formatField(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function priorityClass(priority: string) {
  if (priority === "High") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
  if (priority === "Medium") return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  return "bg-gray-100 text-gray-700";
}
