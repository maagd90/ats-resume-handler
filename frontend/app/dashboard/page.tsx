"use client";

import GetStartedChecklist from "@/components/GetStartedChecklist";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAgentStatus, fetchLatestProposal, fetchProfile, fetchQuota } from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
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
        setProfile(profileData);
        setQuota(quotaData);
        setProposal(proposalData);
        setAgent((agentData as any)?.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (error) return <p className="text-red-600">{error}</p>;

  const hasResume = Boolean(profile?.resume_raw_text);
  const resumeTitle = profile?.contact?.name ? `${profile.contact.name} — Resume` : "My Resume";
  const atsScore = proposal?.resume_score?.overall;
  const progress = hasResume ? (proposal ? 100 : 60) : 0;

  const stats = [
    { label: "Total Resumes", value: hasResume ? "1" : "0" },
    { label: "ATS Score", value: atsScore != null ? `${Math.round(atsScore)}%` : "—" },
    { label: "Optimizations", value: quota ? `${quota.used}/${quota.limit}` : "—" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{profile?.contact?.name ? `, ${profile.contact.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">Manage your resumes and track your progress.</p>
        </div>
        <Link href="/optimize" className="btn-primary">Open editor</Link>
      </div>

      <GetStartedChecklist
        hasResume={hasResume}
        hasScore={atsScore != null}
        hasTemplate={Boolean(profile?.resume_template_settings)}
        hasExport={Boolean(proposal?.optimized_resume_path)}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Your Resumes</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasResume && (
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground">{resumeTitle}</h3>
              <p className="text-sm text-muted-foreground">PassATS layout preset</p>
              <span className={`badge mt-2 ${proposal ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : ""}`}>
                {proposal ? "Optimized" : "Draft"}
              </span>
              <div className="progress-bar mt-4">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              {atsScore != null && <p className="mt-2 text-sm text-muted-foreground">ATS score: {Math.round(atsScore)}%</p>}
              <Link href="/optimize" className="btn-primary mt-4 inline-block w-full text-center">Edit</Link>
            </div>
          )}
          <Link
            href="/optimize"
            className="card flex flex-col items-center justify-center border-2 border-dashed border-border py-16 text-center hover:border-brand-600 hover:bg-brand-600/5"
          >
            <span className="text-3xl text-muted-foreground">+</span>
            <h3 className="mt-2 font-medium text-foreground">{hasResume ? "New upload" : "Upload resume"}</h3>
            <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT</p>
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/optimize" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-brand-600">Resume Builder</div>
              <div className="text-sm text-muted-foreground">Upload and optimize</div>
            </div>
          </Link>
          <Link href="/linkedin" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-brand-600">LinkedIn Guide</div>
              <div className="text-sm text-muted-foreground">Profile optimization</div>
            </div>
          </Link>
          <Link href="/pricing" className="btn-outline h-auto justify-start p-4">
            <div className="text-left">
              <div className="font-medium text-brand-600">Get Prime</div>
              <div className="text-sm text-muted-foreground">
                {agent?.is_running ? "Automation running" : "Unlock all features"}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
