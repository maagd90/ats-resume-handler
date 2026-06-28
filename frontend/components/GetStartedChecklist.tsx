"use client";

import Link from "next/link";

const STEPS = [
  { label: "Upload resume", href: "/resume", done: (p: { hasResume: boolean }) => p.hasResume },
  { label: "Run ATS check", href: "/resume", done: (p: { hasScore: boolean }) => p.hasScore },
  { label: "Pick a layout", href: "/templates", done: (p: { hasTemplate: boolean }) => p.hasTemplate },
  { label: "Export or configure automation", href: "/optimize", done: (p: { hasExport: boolean }) => p.hasExport },
];

export default function GetStartedChecklist({
  hasResume,
  hasScore,
  hasTemplate,
  hasExport,
}: {
  hasResume: boolean;
  hasScore: boolean;
  hasTemplate: boolean;
  hasExport: boolean;
}) {
  const props = { hasResume, hasScore, hasTemplate, hasExport };
  const complete = STEPS.filter((s) => s.done(props)).length;
  if (complete === STEPS.length) return null;

  return (
    <div className="card border-brand-600/20 bg-brand-50/30 dark:bg-brand-950/20">
      <h3 className="font-semibold text-foreground">Get started ({complete}/{STEPS.length})</h3>
      <ul className="mt-3 space-y-2">
        {STEPS.map((step) => {
          const done = step.done(props);
          return (
            <li key={step.label} className="flex items-center gap-2 text-sm">
              <span className={done ? "text-brand-600" : "text-muted-foreground"}>{done ? "✓" : "○"}</span>
              {done ? (
                <span className="text-muted-foreground line-through">{step.label}</span>
              ) : (
                <Link href={step.href} className="text-brand-600 hover:underline dark:text-brand-400">
                  {step.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
