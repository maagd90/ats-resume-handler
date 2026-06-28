"use client";

import { useState } from "react";
import { analyzeLinkedIn } from "@/lib/api";

export default function LinkedInPage() {
  const [linkedinText, setLinkedinText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function handleAnalyze() {
    if (!linkedinText.trim()) {
      setError("Paste your LinkedIn profile text first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await analyzeLinkedIn(linkedinText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">LinkedIn Optimizer</h1>
        <p className="mt-2 text-slate-600">
          Paste your LinkedIn headline, About section, and experience to get job-hunting optimizations.
        </p>
      </section>

      <section className="card">
        <label className="block text-sm font-medium text-slate-700">LinkedIn Profile Text</label>
        <textarea
          rows={12}
          value={linkedinText}
          onChange={(e) => setLinkedinText(e.target.value)}
          placeholder={"Headline\n\nAbout\n...\n\nExperience\n..."}
          className="textarea mt-3"
        />
        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4">
          {loading ? "Analyzing..." : "Optimize Profile"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {result && (
        <>
          <section className="card">
            <h2 className="text-xl font-semibold">Headline Variants</h2>
            <div className="mt-4 space-y-3">
              {(result.headline_variants || []).map((headline: string, index: number) => (
                <div key={index} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-700">{headline}</p>
                  <button onClick={() => copyText(`headline-${index}`, headline)} className="btn-secondary shrink-0">
                    {copied === `headline-${index}` ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="card">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Optimized About</h2>
                <button onClick={() => copyText("about", result.optimized_about)} className="btn-secondary">
                  {copied === "about" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{result.optimized_about}</p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold">Skills to Add</h2>
              <p className="mt-4 text-sm text-slate-700">{(result.skills_to_add || []).join(", ") || "None suggested"}</p>
              {result.analysis && (
                <div className="mt-6 space-y-2">
                  {Object.entries(result.analysis).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold uppercase text-slate-500">{key}</p>
                      <p className="text-sm text-slate-700">{value as string}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {result.experience_upgrades?.length > 0 && (
            <section className="card">
              <h2 className="text-xl font-semibold">Experience Upgrades</h2>
              <div className="mt-4 space-y-4">
                {result.experience_upgrades.map((item: any, index: number) => (
                  <div key={index} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium text-slate-800">{item.role || `Role ${index + 1}`}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {item.upgraded_bullets || JSON.stringify(item)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
