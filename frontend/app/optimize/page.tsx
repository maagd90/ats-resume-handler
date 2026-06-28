"use client";

import { useEffect, useState } from "react";
import GuidancePanel from "@/components/GuidancePanel";
import ImpactImprovementPlan from "@/components/ImpactImprovementPlan";
import IssueList from "@/components/IssueList";
import ResumePreview from "@/components/ResumePreview";
import ScoreRing from "@/components/ScoreRing";
import StepProgress from "@/components/StepProgress";
import UploadZone from "@/components/UploadZone";
import {
  fetchLatestProposal,
  fetchProfile,
  fetchQuota,
  getLinkedInPackDownloadUrl,
  getResumeDownloadUrl,
  runOptimizer,
  uploadResume,
} from "@/lib/api";

export default function OptimizePage() {
  const [linkedinText, setLinkedinText] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asciiSafeExport, setAsciiSafeExport] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetchQuota().then(setQuota).catch(() => {});
    fetchLatestProposal().then(setProposal).catch(() => {});
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  async function handleUpload(file: File) {
    const updated = await uploadResume(file);
    setProfile(updated);
    setStep(1);
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");
    setStep(2);
    try {
      const result = await runOptimizer(linkedinText);
      setProposal(result);
      setStep(3);
      const q = await fetchQuota();
      setQuota(q);
      fetchProfile().then(setProfile).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Optimizer</h1>
          <p className="mt-1 text-sm text-slate-500">Build an ATS-friendly resume and LinkedIn profile in four steps.</p>
        </div>
        {quota && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
            <span className="text-slate-500">Plan:</span>{" "}
            <span className="font-semibold capitalize text-brand-700">{quota.tier}</span>
            <span className="mx-2 text-slate-300">|</span>
            {quota.used}/{quota.limit} runs this month
          </div>
        )}
      </div>

      <StepProgress current={step} />

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Left: inputs */}
        <div className="space-y-5 xl:col-span-2">
          <section className="card-elevated space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Step 1 · Resume</h2>
            <UploadZone onFile={handleUpload} />
          </section>

          <section className="card-elevated space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Step 2 · LinkedIn</h2>
            <textarea
              rows={8}
              value={linkedinText}
              onChange={(e) => {
                setLinkedinText(e.target.value);
                if (e.target.value.trim()) setStep(Math.max(step, 1));
              }}
              className="textarea"
              placeholder={"Paste your LinkedIn headline, About, and Experience sections here..."}
            />
            <button onClick={handleOptimize} disabled={loading || !profile?.resume_raw_text} className="btn-primary w-full">
              {loading ? "Analyzing with AI..." : "Run Optimization"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </section>

          {proposal && (
            <section className="card-elevated space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Step 4 · Download</h2>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <input type="checkbox" checked={asciiSafeExport} onChange={(e) => setAsciiSafeExport(e.target.checked)} className="mt-1" />
                <span className="text-sm text-slate-600">ASCII-safe export for legacy ATS systems</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <a href={getResumeDownloadUrl(proposal.id, asciiSafeExport)} className="btn-primary" download>
                  Download Resume
                </a>
                {proposal.linkedin_pack_path && (
                  <a href={getLinkedInPackDownloadUrl(proposal.id, asciiSafeExport)} className="btn-secondary" download>
                    LinkedIn Pack
                  </a>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Center: scores & analysis */}
        <div className="space-y-5 xl:col-span-2">
          {proposal?.resume_score ? (
            <section className="card-elevated">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">ATS Analysis</h2>
              <div className="flex flex-wrap items-center justify-around gap-6">
                <ScoreRing label="Overall" value={proposal.resume_score.overall} size={140} />
                <div className="grid grid-cols-2 gap-4">
                  <ScoreRing label="Keywords" value={proposal.resume_score.keywords} size={90} accent="#8b5cf6" />
                  <ScoreRing label="Impact" value={proposal.resume_score.impact} size={90} accent="#a855f7" />
                  <ScoreRing label="Structure" value={proposal.resume_score.structure} size={90} accent="#6366f1" />
                  <ScoreRing label="Parse" value={proposal.resume_score.parseability} size={90} accent="#7c3aed" />
                </div>
              </div>
            </section>
          ) : (
            <section className="card-elevated flex min-h-[200px] items-center justify-center text-center text-sm text-slate-400">
              Run optimization to see your ATS score breakdown
            </section>
          )}

          {proposal?.impact_improvement_plan && (
            <section className="card-elevated">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Path to 100% Impact</h2>
              <div className="mt-3">
                <ImpactImprovementPlan plan={proposal.impact_improvement_plan} />
              </div>
            </section>
          )}

          {proposal?.resume_issues?.length > 0 && (
            <section className="card-elevated">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Issues Found</h2>
              <div className="mt-3">
                <IssueList issues={proposal.resume_issues} />
              </div>
            </section>
          )}
        </div>

        {/* Right: preview + guidance */}
        <div className="space-y-5 xl:col-span-1">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Live Preview</h2>
            <ResumePreview profile={profile} compact />
          </section>
          {proposal && (
            <GuidancePanel
              changes={proposal.linkedin_changes || []}
              guidance={proposal.linkedin_guidance || []}
              headlineVariants={proposal.headline_variants || []}
              skillsToAdd={proposal.skills_to_add || []}
              warnings={proposal.validation_warnings || []}
              quota={quota}
            />
          )}
        </div>
      </div>
    </div>
  );
}
