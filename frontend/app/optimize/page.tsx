"use client";

import GuidancePanel from "@/components/GuidancePanel";
import ImpactImprovementPlan from "@/components/ImpactImprovementPlan";
import IssueList from "@/components/IssueList";
import ResumePreview from "@/components/ResumePreview";
import ScoreRing from "@/components/ScoreRing";
import UploadZone from "@/components/UploadZone";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchLatestProposal,
  fetchProfile,
  fetchQuota,
  getLinkedInPackDownloadUrl,
  getResumeDownloadUrl,
  runOptimizer,
  uploadResume,
} from "@/lib/api";

type SectionId = "personal" | "experience" | "education" | "skills" | "linkedin";

function sectionProgress(profile: any, linkedinText: string, proposal: any): Record<SectionId, number> {
  const contact = profile?.contact || {};
  const personalFields = [contact.name, contact.email, contact.phone, profile?.summary].filter(Boolean).length;
  const personal = Math.min(100, Math.round((personalFields / 4) * 100));

  const expCount = profile?.experience?.length || 0;
  const experience = expCount ? Math.min(100, 40 + expCount * 15) : 0;

  const eduCount = profile?.education?.length || 0;
  const education = eduCount ? Math.min(100, 50 + eduCount * 25) : 0;

  const skillCount = profile?.skills?.length || 0;
  const skills = skillCount ? Math.min(100, 30 + skillCount * 5) : 0;

  let linkedin = 0;
  if (linkedinText.trim()) linkedin += 50;
  if (proposal) linkedin = 100;

  return { personal, experience, education, skills, linkedin };
}

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "personal", label: "Personal Info" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "linkedin", label: "LinkedIn & AI" },
];

export default function OptimizePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [linkedinText, setLinkedinText] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asciiSafeExport, setAsciiSafeExport] = useState(false);

  useEffect(() => {
    fetchQuota().then(setQuota).catch(() => {});
    fetchLatestProposal().then(setProposal).catch(() => {});
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const progress = useMemo(
    () => sectionProgress(profile, linkedinText, proposal),
    [profile, linkedinText, proposal],
  );

  const overallProgress = useMemo(() => {
    const values = Object.values(progress);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [progress]);

  async function handleUpload(file: File) {
    const updated = await uploadResume(file);
    setProfile(updated);
    setActiveSection("linkedin");
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");
    try {
      const result = await runOptimizer(linkedinText);
      setProposal(result);
      setQuota(await fetchQuota());
      fetchProfile().then(setProfile).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  const resumeTitle = profile?.contact?.name
    ? `${profile.contact.name} — Resume`
    : "Resume Builder";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-outline flex items-center gap-2 text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Resume Builder</h1>
              <p className="text-sm text-muted-foreground">{resumeTitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {quota && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {quota.used}/{quota.limit} runs · {quota.tier}
              </span>
            )}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="progress-bar w-20">
                <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            {proposal && (
              <a
                href={getResumeDownloadUrl(proposal.id, asciiSafeExport)}
                className="btn-primary text-sm"
                download
              >
                Download
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left panel */}
        <div className="flex w-full flex-col border-r border-gray-200 bg-white lg:w-1/2">
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <div className="space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                    activeSection === section.id ? "nav-active" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">{section.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-12">
                      <div className="progress-fill" style={{ width: `${progress[section.id]}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{progress[section.id]}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {activeSection === "personal" && (
              <div className="space-y-6">
                <UploadZone onFile={handleUpload} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="input mt-1 bg-gray-50">{profile?.contact?.name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="input mt-1 bg-gray-50">{profile?.contact?.email || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="input mt-1 bg-gray-50">{profile?.contact?.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                    <p className="input mt-1 truncate bg-gray-50">{profile?.contact?.linkedin_url || "—"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                  <p className="textarea mt-1 min-h-[100px] bg-gray-50">{profile?.summary || "Upload a resume to populate."}</p>
                </div>
              </div>
            )}

            {activeSection === "experience" && (
              <div className="space-y-4">
                {(profile?.experience || []).length ? (
                  profile.experience.map((exp: any, i: number) => (
                    <div key={i} className="card p-4">
                      <p className="font-medium text-gray-900">{exp.title || "Role"}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                        {exp.start_date && ` · ${exp.start_date}${exp.end_date ? ` – ${exp.end_date}` : ""}`}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        {(exp.bullets || []).slice(0, 4).map((b: string, j: number) => (
                          <li key={j}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="py-12 text-center text-muted-foreground">Upload a resume to see experience.</p>
                )}
              </div>
            )}

            {activeSection === "education" && (
              <div className="space-y-4">
                {(profile?.education || []).length ? (
                  profile.education.map((edu: any, i: number) => (
                    <div key={i} className="card p-4">
                      <p className="font-medium text-gray-900">{edu.degree || "Degree"}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No education detected yet.</p>
                )}
              </div>
            )}

            {activeSection === "skills" && (
              <div>
                {profile?.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string) => (
                      <span key={skill} className="badge bg-gray-100 text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">Upload a resume to extract skills.</p>
                )}
              </div>
            )}

            {activeSection === "linkedin" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">LinkedIn profile text</label>
                  <textarea
                    rows={8}
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    className="textarea mt-1"
                    placeholder="Paste your LinkedIn headline, About, and Experience sections..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={loading || !profile?.resume_raw_text}
                  className="btn-primary w-full"
                >
                  {loading ? "Analyzing with AI..." : "Run Optimization"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}

                {proposal && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <input
                        type="checkbox"
                        checked={asciiSafeExport}
                        onChange={(e) => setAsciiSafeExport(e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-600">ASCII-safe export for legacy ATS systems</span>
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
                    {proposal.resume_score && (
                      <div className="card">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">ATS Analysis</h3>
                        <div className="flex flex-wrap items-center justify-around gap-4">
                          <ScoreRing label="Overall" value={proposal.resume_score.overall} size={100} />
                          <ScoreRing label="Keywords" value={proposal.resume_score.keywords} size={72} accent="#2563eb" />
                          <ScoreRing label="Impact" value={proposal.resume_score.impact} size={72} accent="#14b8a6" />
                        </div>
                      </div>
                    )}
                    {proposal.impact_improvement_plan && (
                      <div className="card">
                        <ImpactImprovementPlan plan={proposal.impact_improvement_plan} />
                      </div>
                    )}
                    {proposal.resume_issues?.length > 0 && (
                      <div className="card">
                        <IssueList issues={proposal.resume_issues} />
                      </div>
                    )}
                    <GuidancePanel
                      changes={proposal.linkedin_changes || []}
                      guidance={proposal.linkedin_guidance || []}
                      headlineVariants={proposal.headline_variants || []}
                      skillsToAdd={proposal.skills_to_add || []}
                      warnings={proposal.validation_warnings || []}
                      quota={quota}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — preview */}
        <div className="w-full overflow-auto bg-gray-100 p-4 sm:p-6 lg:w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <span className="text-xs text-muted-foreground">Inter · ATS template</span>
          </div>
          <ResumePreview profile={profile} />
        </div>
      </div>
    </div>
  );
}
