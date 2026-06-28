"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchAgentStatus,
  fetchLatestProposal,
  fetchProfile,
  fetchQuota,
  reviewResume,
} from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profileData, quotaData, proposalData, agentData] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchQuota().catch(() => null),
          fetchLatestProposal().catch(() => null),
          fetchAgentStatus().catch(() => null),
        ]);
        const p = profileData as any;
        const prop = proposalData as any;
        setProfile(p);
        setQuota(quotaData);
        setProposal(prop);
        setAgent((agentData as any)?.status);
        if (p?.resume_raw_text) {
          const review = (await reviewResume().catch(() => null)) as any;
          setScore(review?.score || prop?.resume_score);
        } else if (prop?.resume_score) {
          setScore(prop.resume_score);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="p-8 text-muted-foreground">Loading dashboard...</p>;
  }
  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  const hasResume = Boolean(profile?.resume_raw_text);
  const resumeTitle = profile?.contact?.name
    ? `${profile.contact.name.split(" ").slice(-1)[0] || "My"} Resume`
    : "My Resume";
  const atsScore = score?.overall ?? proposal?.resume_score?.overall;
  const progress = hasResume ? (proposal ? 100 : 60) : 0;

  const stats = [
    { label: "Total Resumes", value: hasResume ? "1" : "0" },
    { label: "ATS Score", value: atsScore != null ? `${Math.round(atsScore)}%` : "—" },
    {
      label: "Optimizations",
      value: quota ? `${quota.used}/${quota.limit}` : "—",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back{profile?.contact?.name ? `, ${profile.contact.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">Manage your resumes and track your progress.</p>
        </div>
            <Link href="/optimize" className="btn-primary shadow-lg">
              Open editor
            </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-brand-600/10 p-3 text-brand-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasResume && (
            <div className="card transition hover:shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{resumeTitle}</h3>
                <p className="text-sm text-muted-foreground">Template: PassATS layout preset</p>
                <span className={`badge mt-2 ${proposal ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  {proposal ? "Optimized" : "Draft"}
                </span>
              </div>
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
              {atsScore != null && (
                <p className="mb-4 text-sm text-muted-foreground">ATS score: {Math.round(atsScore)}%</p>
              )}
              <Link href="/optimize" className="btn-primary w-full text-center">
                Edit
              </Link>
            </div>
          )}

          <Link
            href="/optimize"
            className="card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 py-16 text-center transition hover:border-brand-600 hover:bg-brand-600/5"
          >
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <span className="text-3xl text-gray-400">+</span>
            </div>
            <h3 className="mb-2 font-medium text-gray-900">Create New Resume</h3>
            <p className="text-sm text-muted-foreground">Start building your perfect resume</p>
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/optimize" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-brand-600">Resume Builder</div>
              <div className="text-sm text-muted-foreground">Upload and optimize</div>
            </div>
          </Link>
          <Link href="/linkedin" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-accent-teal">LinkedIn Guide</div>
              <div className="text-sm text-muted-foreground">Profile optimization tips</div>
            </div>
          </Link>
          <Link href="/pricing" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-purple-600">Get Premium</div>
              <div className="text-sm text-muted-foreground">
                {agent?.is_running ? "Agent running" : "Unlock all features"}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
