"use client";

import LinkedInOptimizationPanel from "@/components/LinkedInOptimizationPanel";
import UploadZone from "@/components/UploadZone";
import { analyzeLinkedIn, analyzeLinkedInFile } from "@/lib/api";
import { useState } from "react";

export default function LinkedInPage() {
  const [linkedinText, setLinkedinText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePdfUpload(file: File) {
    setPendingFile(file);
    setFileName(file.name);
    setError("");
    setResult(null);
  }

  async function handleOptimize() {
    if (!pendingFile && !linkedinText.trim()) {
      setError("Upload a LinkedIn PDF export or paste your profile text.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = pendingFile
        ? await analyzeLinkedInFile(pendingFile, linkedinText)
        : await analyzeLinkedIn(linkedinText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">LinkedIn optimizer</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a PDF export of your LinkedIn profile (Profile → More → Save to PDF), then click Optimize to see what to
          change.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <section className="card-elevated space-y-4 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">1 · Upload PDF</h2>
            <UploadZone
              onFile={handlePdfUpload}
              accept=".pdf,.docx,.txt"
              label="Upload LinkedIn profile PDF"
            />
            {fileName && (
              <p className="text-sm text-brand-700 dark:text-brand-400">
                Ready: {fileName}
              </p>
            )}
          </section>

          <section className="card-elevated space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2 · Or paste text (optional)
            </h2>
            <textarea
              rows={8}
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              placeholder="Headline, About, Experience — if you don't have a PDF"
              className="textarea"
            />
            <button type="button" onClick={handleOptimize} disabled={loading} className="btn-primary w-full">
              {loading ? "Analyzing profile…" : "Optimize profile"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </section>
        </div>

        <section className="card-elevated min-h-[320px] p-6">
          {!result ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-medium">Optimization checklist appears here</p>
              <p className="mt-2 max-w-xs text-xs">
                After you optimize, we show headline, About, skills, and experience items to update on LinkedIn.
              </p>
            </div>
          ) : (
            <LinkedInOptimizationPanel
              analysis={result.analysis}
              guidance={result.guidance}
              headlineVariants={result.headline_variants}
              skillsToAdd={result.skills_to_add}
              experienceUpgrades={result.experience_upgrades}
              optimizedAbout={result.optimized_about}
              warnings={result.validation_warnings}
              extractedPreview={result.extracted_text_preview}
            />
          )}
        </section>
      </div>
    </div>
  );
}
