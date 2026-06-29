"use client";

import ImpactImprovementPlan from "@/components/ImpactImprovementPlan";
import IssueList from "@/components/IssueList";
import RecruiterAppealPanel from "@/components/RecruiterAppealPanel";
import RedFlagList from "@/components/RedFlagList";
import ResumePreview from "@/components/ResumePreview";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import ScoreGuidance from "@/components/ScoreGuidance";
import UploadZone from "@/components/UploadZone";
import { optimizeResume, reviewResume, uploadResume } from "@/lib/api";
import { useState } from "react";

export default function ResumePage() {
  const [profile, setProfile] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showOptimized, setShowOptimized] = useState(false);

  async function handleUpload(file: File) {
    setLoading(true);
    setError("");
    setMessage("");
    setReview(null);
    setShowOptimized(false);
    try {
      const updated = await uploadResume(file);
      setProfile(updated);
      setMessage("Resume uploaded — check quality or generate an optimized version.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview() {
    if (!profile?.resume_raw_text) {
      setError("Upload a CV first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    setShowOptimized(false);
    try {
      const result = (await reviewResume()) as any;
      setReview(result);
      setMessage("Quality check complete — review scores and flags below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptimize() {
    if (!profile?.resume_raw_text) {
      setError("Upload a CV first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = (await optimizeResume()) as any;
      setReview(result);
      setProfile(result.profile || profile);
      setShowOptimized(true);
      setMessage("Optimized resume ready — preview updated on the right.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  const previewProfile = showOptimized && review?.profile ? review.profile : profile;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-foreground">CV optimization</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your CV, check quality, or generate an optimized version with a live preview.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="card-elevated space-y-4 p-6">
            <UploadZone onFile={handleUpload} label="Upload your CV (PDF or DOCX)" />
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleReview}
                disabled={loading || !profile?.resume_raw_text}
                className="btn-secondary w-full"
              >
                {loading ? "Working…" : "Check quality"}
              </button>
              <button
                type="button"
                onClick={handleOptimize}
                disabled={loading || !profile?.resume_raw_text}
                className="btn-primary w-full"
              >
                {loading ? "Working…" : "Optimize resume"}
              </button>
            </div>
            {message && <p className="text-sm text-brand-700 dark:text-brand-400">{message}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </section>

          {review?.score && (
            <section className="card space-y-4 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Score breakdown</h2>
              <ScoreGuidance compact />
              <ScoreBreakdown score={review.score} compact />
            </section>
          )}

          {review?.red_flags?.length > 0 && (
            <section className="card p-6">
              <h2 className="mb-3 font-semibold text-foreground">Recruiter red flags</h2>
              <RedFlagList flags={review.red_flags} />
            </section>
          )}

          {review?.issues?.length > 0 && (
            <section className="card p-6">
              <h2 className="mb-3 font-semibold text-foreground">ATS issues</h2>
              <IssueList issues={review.issues} />
            </section>
          )}

          {(review?.recruiter_feedback || review?.recruiter_checklist?.length > 0) && (
            <RecruiterAppealPanel
              score={review.score?.recruiter_appeal}
              checklist={review.recruiter_checklist}
              feedback={review.recruiter_feedback}
            />
          )}

          {review?.impact_improvement_plan && (
            <section className="card p-6">
              <ImpactImprovementPlan plan={review.impact_improvement_plan} />
            </section>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {showOptimized ? "Optimized preview" : "Live preview"}
            </h2>
            {showOptimized && (
              <span className="badge bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Optimized</span>
            )}
          </div>
          <div className="rounded-lg bg-surface-muted p-4">
            <ResumePreview profile={previewProfile} />
          </div>
          {review?.section_feedback && Object.keys(review.section_feedback).length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-foreground">Section feedback</h3>
              <div className="mt-3 space-y-2">
                {Object.entries(review.section_feedback).map(([section, feedback]) => (
                  <div key={section} className="rounded-lg bg-surface-muted p-3 text-sm">
                    <p className="font-medium capitalize">{section}</p>
                    <p className="mt-1 text-muted-foreground">{feedback as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
