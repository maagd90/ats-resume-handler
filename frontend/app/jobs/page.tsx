"use client";

import { useEffect, useState } from "react";
import JobList from "@/components/JobList";
import ScoreCard from "@/components/ScoreCard";
import { searchJobs, scoreJob } from "@/lib/api";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [jdText, setJdText] = useState("");
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs(customQuery?: string, customLocation?: string) {
    setLoading(true);
    setError("");
    try {
      const data = await searchJobs(customQuery || query || undefined, customLocation || location || undefined);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleScore() {
    if (!jdText.trim()) {
      setError("Paste a job description to score.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await scoreJob(jdText);
      setScore(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Job Matches</h1>
        <p className="mt-2 text-slate-600">Search live jobs and score fit against your profile.</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Search Jobs</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Role (e.g. software engineer)"
            className="input"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. remote)"
            className="input"
          />
          <button onClick={() => loadJobs()} disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search Jobs"}
          </button>
        </div>
      </section>

      <section>
        <JobList jobs={jobs} />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Score a Job Description</h2>
        <textarea
          rows={8}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste a job description here..."
          className="textarea mt-4"
        />
        <button onClick={handleScore} disabled={loading} className="btn-primary mt-4">
          Score Fit
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {score && (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreCard label="Fit Score" value={score.fit_score} />
            <div className="card sm:col-span-2">
              <p className="text-sm font-semibold text-slate-800">Suggested Tweaks</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {(score.suggested_tweaks || []).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card">
              <p className="text-sm font-semibold text-green-700">Matched Skills</p>
              <p className="mt-2 text-sm text-slate-700">{(score.matched_skills || []).join(", ") || "None"}</p>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-amber-700">Missing Skills</p>
              <p className="mt-2 text-sm text-slate-700">{(score.missing_skills || []).join(", ") || "None"}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
