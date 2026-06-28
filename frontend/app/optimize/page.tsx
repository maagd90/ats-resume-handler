"use client";

import { useEffect, useState } from "react";
import GuidancePanel from "@/components/GuidancePanel";
import ScoreCard from "@/components/ScoreCard";
import IssueList from "@/components/IssueList";
import ImpactImprovementPlan from "@/components/ImpactImprovementPlan";
import {
  fetchQuota,
  runOptimizer,
  uploadResume,
  fetchLatestProposal,
  getResumeDownloadUrl,
  getLinkedInPackDownloadUrl,
} from "@/lib/api";

export default function OptimizePage() {
  const [linkedinText, setLinkedinText] = useState("");
  const [proposal, setProposal] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asciiSafeExport, setAsciiSafeExport] = useState(false);

  useEffect(() => {
    fetchQuota().then(setQuota).catch(() => {});
    fetchLatestProposal().then(setProposal).catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadResume(file);
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");
    try {
      const result = await runOptimizer(linkedinText);
      setProposal(result);
      const q = await fetchQuota();
      setQuota(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Profile Optimizer</h1>
        <p className="mt-2 text-slate-600">
          Upload your resume, paste your LinkedIn profile, and get ATS-friendly optimizations with step-by-step guidance.
        </p>
        {quota && (
          <p className="mt-1 text-sm text-slate-500">
            Plan: {quota.tier} — {quota.used}/{quota.limit} optimizations used this month
          </p>
        )}
      </section>

      <section className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Upload Resume</label>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} className="mt-2 block w-full text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Paste LinkedIn Profile</label>
            <textarea
              rows={6}
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              className="textarea mt-2"
              placeholder="Headline&#10;&#10;About&#10;...&#10;Experience&#10;..."
            />
          </div>
        </div>
        <button onClick={handleOptimize} disabled={loading} className="btn-primary mt-4">
          {loading ? "Optimizing..." : "Run Optimization"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {proposal && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {proposal.resume_score && (
              <section>
                <h2 className="mb-3 text-lg font-semibold">ATS Score</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <ScoreCard label="Overall" value={proposal.resume_score.overall} />
                  <ScoreCard label="Keywords" value={proposal.resume_score.keywords} />
                  <ScoreCard label="Impact" value={proposal.resume_score.impact} />
                </div>
              </section>
            )}

            {proposal.impact_improvement_plan && (
              <section className="card">
                <h2 className="text-lg font-semibold">Path to 100% Impact</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Follow these steps to strengthen quantified achievements, action verbs, and your summary.
                </p>
                <div className="mt-3">
                  <ImpactImprovementPlan plan={proposal.impact_improvement_plan} />
                </div>
              </section>
            )}

            {proposal.resume_issues?.length > 0 && (
              <section className="card">
                <h2 className="text-lg font-semibold">Issues Found</h2>
                <div className="mt-3">
                  <IssueList issues={proposal.resume_issues} />
                </div>
              </section>
            )}

            <section className="card space-y-3">
              <h2 className="text-lg font-semibold">Downloads</h2>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={asciiSafeExport}
                  onChange={(e) => setAsciiSafeExport(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">ASCII-safe export (legacy ATS)</span>
                  <span className="mt-0.5 block text-slate-500">
                    Converts accented characters, smart quotes, and special dashes to plain ASCII.
                    Recommended for older applicant tracking systems in the US and some enterprise HR platforms.
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                <a
                  href={getResumeDownloadUrl(proposal.id, asciiSafeExport)}
                  className="btn-primary"
                  download
                >
                  {asciiSafeExport ? "Download Resume (ASCII Word)" : "Download Resume (Word)"}
                </a>
                {proposal.linkedin_pack_path && (
                  <a
                    href={getLinkedInPackDownloadUrl(proposal.id, asciiSafeExport)}
                    className="btn-secondary"
                    download
                  >
                    {asciiSafeExport ? "Download LinkedIn Pack (ASCII Word)" : "Download LinkedIn Pack (Word)"}
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Resume uses ATS-safe template: Calibri 11pt, 1-inch margins, single column, standard sections.
                {asciiSafeExport && " ASCII mode strips non-ASCII characters for maximum parser compatibility."}
              </p>
            </section>

            {[...(proposal.resume_changes || []), ...(proposal.linkedin_changes || [])].map((change: any) => (
              <div key={`${change.section}-${change.field}`} className="card">
                <p className="text-xs font-semibold uppercase text-slate-400">{change.section} — {change.field}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-red-600">Before</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{change.before || "(empty)"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600">After</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <GuidancePanel
              changes={proposal.linkedin_changes || []}
              guidance={proposal.linkedin_guidance || []}
              headlineVariants={proposal.headline_variants || []}
              skillsToAdd={proposal.skills_to_add || []}
              warnings={proposal.validation_warnings || []}
              quota={quota}
            />
          </div>
        </div>
      )}
    </div>
  );
}
