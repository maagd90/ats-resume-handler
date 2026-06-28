"use client";

import { fetchAiPipeline, fetchQuota } from "@/lib/api";
import { useEffect, useState } from "react";

type PipelineInfo = {
  llm_configured: boolean;
  provider: string;
  model: string;
  temperature: number;
  response_format: string;
  pipeline_steps: Array<{
    step: number;
    name: string;
    ai: boolean;
    detail: string;
    prompt?: string;
  }>;
  prompts: Record<
    string,
    {
      purpose: string;
      preview: string;
      char_count: number;
    }
  >;
  fallback_behavior: string;
};

export default function AiPipelinePanel() {
  const [platformAi, setPlatformAi] = useState<boolean | null>(null);
  const [pipeline, setPipeline] = useState<PipelineInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  useEffect(() => {
    fetchQuota()
      .then((q: { platform_ai?: boolean }) => setPlatformAi(Boolean(q.platform_ai)))
      .catch(() => setPlatformAi(false));

    fetchAiPipeline()
      .then((info) => setPipeline(info as PipelineInfo))
      .catch(() => setPipeline(null));
  }, []);

  const statusLine =
    platformAi === null
      ? "Checking platform AI…"
      : platformAi
        ? `Platform AI active — ${pipeline?.model ?? "gpt-4o-mini"} (temperature ${pipeline?.temperature ?? 0.3}, JSON mode)`
        : "Platform AI off — set OPENAI_API_KEY in backend/.env for real prompts";

  return (
    <div className="card border-brand-600/20 bg-brand-50/50 p-4 dark:bg-brand-950/20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">How AI optimization works</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{statusLine}</p>
        </div>
        <span className="text-sm text-brand-700">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-brand-600/10 pt-4">
          {(pipeline?.pipeline_steps ?? []).map((step) => (
            <div key={step.step}>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {step.step}. {step.name}
                {step.ai ? (
                  <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                    LLM
                  </span>
                ) : (
                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-gray-400">
                    Rules
                  </span>
                )}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
              {step.prompt && (
                <button
                  type="button"
                  onClick={() => setActivePrompt(activePrompt === step.prompt ? null : step.prompt!)}
                  className="mt-1 text-xs text-brand-700 hover:underline dark:text-brand-300"
                >
                  {activePrompt === step.prompt ? "Hide" : "View"} prompt: {step.prompt}
                </button>
              )}
              {step.prompt && activePrompt === step.prompt && pipeline?.prompts[step.prompt] && (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-brand-600/10 bg-white/80 p-3 text-[11px] leading-relaxed text-gray-800 dark:bg-slate-900 dark:text-gray-200">
                  {pipeline.prompts[step.prompt].preview}
                </pre>
              )}
            </div>
          ))}

          {pipeline?.prompts && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">All prompt templates</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(pipeline.prompts).map(([name, meta]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActivePrompt(activePrompt === name ? null : name)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      activePrompt === name
                        ? "border-brand-600 bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                        : "border-gray-200 bg-white text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {activePrompt && pipeline.prompts[activePrompt] && !pipeline.pipeline_steps.some((s) => s.prompt === activePrompt) && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">{pipeline.prompts[activePrompt].purpose}</p>
                  <pre className="mt-1 max-h-48 overflow-auto rounded-md border border-brand-600/10 bg-white/80 p-3 text-[11px] leading-relaxed text-gray-800 dark:bg-slate-900 dark:text-gray-200">
                    {pipeline.prompts[activePrompt].preview}
                  </pre>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Each LLM call sends a <strong>system prompt</strong> (from the .txt files above) plus a{" "}
            <strong>user message</strong> built from your parsed resume: a VERIFIED FACTS block, target roles, and full
            resume/LinkedIn text. The model must return JSON only — no free-form chat.
          </p>
          {pipeline?.fallback_behavior && (
            <p className="text-xs text-amber-800 dark:text-amber-200">{pipeline.fallback_behavior}</p>
          )}
        </div>
      )}
    </div>
  );
}
