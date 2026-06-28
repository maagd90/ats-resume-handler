"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import JobList from "@/components/JobList";
import { fetchProfile, reviewResume, searchJobs } from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData);
        if (profileData.resume_raw_text) {
          const review = await reviewResume();
          setScore(review.score);
        }
        const jobData = await searchJobs();
        setJobs((jobData.jobs || []).slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-600">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Unified view of your candidate profile, ATS score, and top job matches.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold">Candidate Profile</h2>
          {profile?.resume_raw_text ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><strong>Name:</strong> {profile.contact?.name || "Not detected"}</p>
              <p><strong>Email:</strong> {profile.contact?.email || "Not detected"}</p>
              <p><strong>Target Roles:</strong> {(profile.target_roles || []).join(", ") || "Not set"}</p>
              <p><strong>Skills:</strong> {(profile.skills || []).slice(0, 12).join(", ") || "None detected"}</p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-slate-600">Upload a resume to populate your profile.</p>
              <Link href="/resume" className="btn-primary mt-3 inline-block">Go to Resume Review</Link>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/resume" className="btn-secondary text-center">Review Resume</Link>
            <Link href="/linkedin" className="btn-secondary text-center">Optimize LinkedIn</Link>
            <Link href="/jobs" className="btn-secondary text-center">Find Jobs</Link>
          </div>
        </div>
      </section>

      {score && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Latest ATS Score</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ScoreCard label="Overall" value={score.overall} />
            <ScoreCard label="Parseability" value={score.parseability} />
            <ScoreCard label="Structure" value={score.structure} />
            <ScoreCard label="Keywords" value={score.keywords} />
            <ScoreCard label="Impact" value={score.impact} />
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Job Matches</h2>
          <Link href="/jobs" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>
        </div>
        <JobList jobs={jobs} />
      </section>
    </div>
  );
}
