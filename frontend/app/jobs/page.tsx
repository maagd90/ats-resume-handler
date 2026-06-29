"use client";

import { useEffect, useState } from "react";
import JobList from "@/components/JobList";
import ScoreCard from "@/components/ScoreCard";
import ScoreGuidance from "@/components/ScoreGuidance";
import Link from "next/link";
import { fetchProfile, searchJobs, scoreJob } from "@/lib/api";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [jdText, setJdText] = useState("");
  const [score, setScore] = useState<any>(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs(customQuery?: string, customLocation?: string) {
    setLoading(true);
    setError("");
    try {
      const data = (await searchJobs(customQuery || query || undefined, customLocation || location || undefined)) as any;
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    fetchProfile()
      .then((profile: any) => setHasResume(Boolean(profile?.resume_raw_text)))
      .catch(() => setHasResume(false));
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
        <h1 className="text-3xl font-bold text-foreground">Job Matches</h1>
        <p className="mt-2 text-muted-foreground">Search live jobs and score fit against your profile.</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-foreground">Search Jobs</h2>
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
        <h2 className="text-lg font-semibold text-foreground">Score a Job Description</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your resume vs this job — paste a posting to see fit and gaps.</p>
        {hasResume === false && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-medium text-foreground">Upload a resume first</p>
            <p className="mt-1 text-muted-foreground">
              JD scoring compares your uploaded CV to the posting.{" "}
              <Link href="/resume" className="text-brand-600 hover:underline dark:text-brand-400">
                Upload your CV →
              </Link>
            </p>
          </div>
        )}
        <textarea
          rows={8}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste a job description here..."
          className="textarea mt-4"
        />
        <button onClick={handleScore} disabled={loading || hasResume === false} className="btn-primary mt-4">
          Score Fit
        </button>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </section>

      {score && (
        <section className="space-y-4">
          <ScoreGuidance />
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreCard label="Fit Score" value={score.fit_score} />
            <div className="card sm:col-span-2">
              <p className="text-sm font-semibold text-foreground">Suggested Tweaks</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {(score.suggested_tweaks || []).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your resume vs this job</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Matched Skills</p>
                <p className="mt-2 text-sm text-foreground">{(score.matched_skills || []).join(", ") || "None"}</p>
              </div>
              <div className="card">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Missing Skills</p>
                <p className="mt-2 text-sm text-foreground">{(score.missing_skills || []).join(", ") || "None"}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );

}
