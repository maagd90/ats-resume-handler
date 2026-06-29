"use client";

import type { TemplatePreset } from "@/lib/resumeTemplates";

export default function TemplatePreviewCard({
  template,
  selected = false,
}: {
  template: TemplatePreset;
  selected?: boolean;
}) {
  const v = template.previewVariant;

  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-md border bg-white p-3 shadow-inner dark:bg-slate-900 ${
        selected ? "border-brand-600 ring-2 ring-brand-600/30" : "border-gray-200 dark:border-slate-700"
      }`}
      aria-hidden
    >
      {/* Programmatic mini-resume — no stock photos or copied artwork */}
      <div
        className={`h-full w-full text-[6px] leading-tight text-gray-800 dark:text-gray-200 ${
          v === "compact" ? "font-sans" : v === "skills-first" ? "font-sans tracking-tight" : "font-serif"
        }`}
      >
        <div className={`mb-2 border-b border-gray-300 pb-1 dark:border-slate-600 ${v === "compact" ? "text-[7px]" : ""}`}>
          <div className="font-bold">Your Name</div>
          <div className="text-gray-500">email · phone · city</div>
        </div>
        {v === "skills-first" && (
          <>
            <div className="mb-1 font-semibold uppercase text-gray-600">Skills</div>
            <div className="mb-2 flex flex-wrap gap-0.5">
              {["Python", "SQL", "API"].map((s) => (
                <span key={s} className="rounded bg-gray-100 px-0.5 dark:bg-slate-800">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
        <div className="mb-1 font-semibold uppercase text-gray-600">Summary</div>
        <div className="mb-2 h-3 rounded bg-gray-100 dark:bg-slate-800" />
        {v !== "skills-first" && (
          <>
            <div className="mb-1 font-semibold uppercase text-gray-600">Experience</div>
            <div className="mb-1 h-1.5 w-2/3 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="mb-2 space-y-0.5">
              <div className="h-1 rounded bg-gray-100 dark:bg-slate-800" />
              <div className="h-1 rounded bg-gray-100 dark:bg-slate-800" />
            </div>
          </>
        )}
        {v === "skills-first" && (
          <>
            <div className="mb-1 font-semibold uppercase text-gray-600">Experience</div>
            <div className="mb-2 h-4 rounded bg-gray-100 dark:bg-slate-800" />
          </>
        )}
        <div className="mb-1 font-semibold uppercase text-gray-600">Education</div>
        <div className="h-1.5 rounded bg-gray-100 dark:bg-slate-800" />
      </div>
      <div className="absolute bottom-1 right-1 rounded bg-brand-600/90 px-1 py-0.5 text-[8px] font-medium text-white">
        {template.name}
      </div>
    </div>
  );
}
