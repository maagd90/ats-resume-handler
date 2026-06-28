"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import JobList from "@/components/JobList";
import { fetchProfile, reviewResume, searchJobs, fetchAgentStatus, startAgent, stopAgent } from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [profileData, agentData] = await Promise.all([fetchProfile(), fetchAgentStatus()]) as any[];
      setProfile(profileData);
      setAgent(agentData.status);
      setActivity(agentData.activity || []);
      if (profileData?.resume_raw_text) {
        const review = await reviewResume() as any;
        setScore(review.score);
      }
      const jobData = await searchJobs() as any;
      setJobs((jobData.jobs || []).slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAgent() {
    if (agent?.is_running) {
      await stopAgent();
    } else {
      await startAgent();
    }
    const agentData = await fetchAgentStatus() as any;
    setAgent(agentData.status);
    setActivity(agentData.activity || []);
  }

  if (loading) return <p className="text-slate-600">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control Panel</h1>
          <p className="mt-2 text-slate-600">Monitor your autonomous job-hunting agent and profile status.</p>
        </div>
        <button onClick={toggleAgent} className={agent?.is_running ? "btn-secondary" : "btn-primary"}>
          {agent?.is_running ? "Pause Agent" : "Start Agent"}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Agent Status</p>
          <p className={`mt-2 text-2xl font-bold ${agent?.is_running ? "text-green-600" : "text-slate-400"}`}>
            {agent?.is_running ? "Running" : "Paused"}
          </p>
          {agent?.next_run_at && (
            <p className="mt-1 text-xs text-slate-500">Next run: {new Date(agent.next_run_at).toLocaleString()}</p>
          )}
        </div>
        <ScoreCard label="Found Today" value={agent?.stats?.jobs_found_today || 0} accent="text-slate-700" />
        <ScoreCard label="Applied Today" value={agent?.stats?.applications_submitted_today || 0} accent="text-green-600" />
        <ScoreCard label="Queued" value={agent?.stats?.applications_queued || 0} accent="text-amber-600" />
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
              <p className="text-sm text-slate-600">Upload a resume to enable the agent.</p>
              <Link href="/resume" className="btn-primary mt-3 inline-block">Upload Resume</Link>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/settings/criteria" className="btn-secondary text-center">Configure Criteria</Link>
            <Link href="/applications" className="btn-secondary text-center">View Applications</Link>
            <Link href="/settings/agent" className="btn-secondary text-center">Agent Settings</Link>
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

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top Job Matches</h2>
            <Link href="/jobs" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>
          </div>
          <JobList jobs={jobs} />
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
            {activity.length ? activity.map((item: any) => (
              <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
                <p>{item.message}</p>
              </li>
            )) : <li className="text-slate-500">No activity yet.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
