"use client";

import { useState } from "react";
import ScoreCard from "@/components/ScoreCard";
import IssueList from "@/components/IssueList";
import { uploadResume, reviewResume, optimizeResume } from "@/lib/api";

export default function ResumePage() {
  const [review, setReview] = useState<any>(null);
  const [optimized, setOptimized] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await uploadResume(file);
      const result = await reviewResume();
      setReview(result);
      setMessage("Resume uploaded and reviewed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");
    try {
      const result = await optimizeResume() as any;
      setOptimized(result.optimized_text || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Resume Review</h1>
        <p className="mt-2 text-slate-600">Upload your resume for ATS scoring, issue detection, and AI optimization.</p>
      </section>

      <section className="card">
        <label className="block text-sm font-medium text-slate-700">Upload Resume (PDF, DOCX, TXT)</label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleUpload}
          disabled={loading}
          className="mt-3 block w-full text-sm"
        />
        <div className="mt-4 flex gap-2">
          <button onClick={handleOptimize} disabled={loading || !review} className="btn-primary">
            Generate Optimized Resume
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {review?.score && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Score Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ScoreCard label="Overall" value={review.score.overall} />
            <ScoreCard label="Parseability" value={review.score.parseability} />
            <ScoreCard label="Structure" value={review.score.structure} />
            <ScoreCard label="Keywords" value={review.score.keywords} />
            <ScoreCard label="Impact" value={review.score.impact} />
          </div>
        </section>
      )}

      {review?.issues && (
        <section className="card">
          <h2 className="text-xl font-semibold">Issues</h2>
          <div className="mt-4">
            <IssueList issues={review.issues} />
          </div>
        </section>
      )}

      {review?.section_feedback && (
        <section className="card">
          <h2 className="text-xl font-semibold">Section Feedback</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(review.section_feedback).map(([section, feedback]) => (
              <div key={section} className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold capitalize text-slate-800">{section}</p>
                <p className="mt-1 text-sm text-slate-600">{feedback as string}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(optimized || review?.optimized_text) && (
        <section className="card">
          <h2 className="text-xl font-semibold">Optimized Preview</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            {optimized || review.optimized_text}
          </pre>
        </section>
      )}
    </div>
  );
}
