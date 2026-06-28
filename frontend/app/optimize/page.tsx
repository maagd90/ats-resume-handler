"use client";

import AiPipelinePanel from "@/components/AiPipelinePanel";
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
  updateProfile,
  uploadResume,
  analyzeLinkedInFile,
} from "@/lib/api";

type SectionId = "personal" | "experience" | "education" | "skills" | "linkedin";

type ProfileDraft = {
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    website?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    bullets?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    graduation_date?: string;
    gpa?: string;
  }>;
  resume_raw_text?: string;
};

function emptyExperience() {
  return { title: "", company: "", location: "", start_date: "", end_date: "", bullets: [""] };
}

function emptyEducation() {
  return { degree: "", institution: "", graduation_date: "", gpa: "" };
}

function sectionProgress(draft: ProfileDraft | null, linkedinText: string, proposal: any): Record<SectionId, number> {
  const contact = draft?.contact || {};
  const personalFields = [contact.name, contact.email, contact.phone, draft?.summary].filter(Boolean).length;
  const personal = Math.min(100, Math.round((personalFields / 4) * 100));
  const expCount = draft?.experience?.filter((e) => e.title && e.company).length || 0;
  const experience = expCount ? Math.min(100, 40 + expCount * 15) : 0;
  const eduCount = draft?.education?.filter((e) => e.degree && e.institution).length || 0;
  const education = eduCount ? Math.min(100, 50 + eduCount * 25) : 0;
  const skillCount = draft?.skills?.length || 0;
  const skills = skillCount ? Math.min(100, 30 + skillCount * 5) : 0;
  let linkedin = linkedinText.trim() ? 50 : 0;
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
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [asciiSafeExport, setAsciiSafeExport] = useState(false);
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    fetchQuota().then(setQuota).catch(() => {});
    fetchLatestProposal().then(setProposal).catch(() => {});
    fetchProfile()
      .then((p: any) => {
        setDraft(p);
        setSkillsText((p?.skills || []).join(", "));
      })
      .catch(() => {});
  }, []);

  const progress = useMemo(() => sectionProgress(draft, linkedinText, proposal), [draft, linkedinText, proposal]);
  const overallProgress = useMemo(() => {
    const values = Object.values(progress);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [progress]);

  function patchDraft(patch: Partial<ProfileDraft>) {
    setDraft((prev) => ({ ...(prev || {}), ...patch }));
  }

  function patchContact(field: string, value: string) {
    setDraft((prev) => ({
      ...(prev || {}),
      contact: { ...(prev?.contact || {}), [field]: value },
    }));
  }

  async function handleUpload(file: File) {
    const updated = (await uploadResume(file)) as ProfileDraft;
    setDraft(updated);
    setSkillsText((updated.skills || []).join(", "));
    setActiveSection("personal");
  }

  async function persistDraft() {
    if (!draft) return;
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return updateProfile({
      contact: draft.contact,
      summary: draft.summary ?? "",
      skills,
      experience: (draft.experience || []).map((e) => ({
        title: e.title || "Role",
        company: e.company || "Company",
        location: e.location || null,
        start_date: e.start_date || null,
        end_date: e.end_date || null,
        bullets: (e.bullets || []).filter(Boolean),
      })),
      education: (draft.education || []).map((e) => ({
        degree: e.degree || "Degree",
        institution: e.institution || "Institution",
        graduation_date: e.graduation_date || null,
        gpa: e.gpa || null,
      })),
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const saved = await persistDraft();
      if (saved) {
        setDraft(saved as ProfileDraft);
        setSkillsText(((saved as any).skills || []).join(", "));
      }
      setSaveMsg("Draft saved.");
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");
    try {
      const saved = await persistDraft();
      if (saved) setDraft(saved as ProfileDraft);
      const result = await runOptimizer(linkedinText);
      setProposal(result);
      setQuota(await fetchQuota());
      const p = await fetchProfile();
      setDraft(p as ProfileDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  const previewProfile = useMemo(() => {
    if (!draft) return null;
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { ...draft, skills: skills.length ? skills : draft.skills };
  }, [draft, skillsText]);

  const resumeTitle = draft?.contact?.name ? `${draft.contact.name} — draft` : "New resume";

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-border bg-surface px-6 py-4">
        <AiPipelinePanel />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-outline flex items-center gap-2 text-sm">
              ← Dashboard
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Resume editor</h1>
              <p className="text-sm text-muted-foreground">{resumeTitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/templates" className="btn-ghost text-sm">Layouts</Link>
            {quota && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {quota.used}/{quota.limit} AI runs
              </span>
            )}
            <div className="hidden items-center gap-2 sm:flex">
              <div className="progress-bar w-20">
                <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <button type="button" onClick={handleSave} disabled={saving || !draft} className="btn-secondary text-sm">
              {saving ? "Saving…" : "Save draft"}
            </button>
            {saveMsg && <span className="text-xs text-brand-600">{saveMsg}</span>}
            {proposal && (
              <a href={getResumeDownloadUrl(proposal.id, asciiSafeExport)} className="btn-primary text-sm" download>
                Download
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col border-r border-border bg-surface lg:w-1/2">
          <div className="border-b border-border p-4 sm:p-6">
            <div className="space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                    activeSection === section.id ? "nav-active" : "text-gray-600 hover:bg-surface-muted dark:text-gray-300"
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
                <UploadZone onFile={handleUpload} label="Upload or replace resume file" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["name", "Full name"],
                      ["email", "Email"],
                      ["phone", "Phone"],
                      ["location", "Location"],
                      ["linkedin_url", "LinkedIn URL"],
                      ["website", "Website"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                      <input
                        className="input mt-1"
                        value={(draft?.contact as any)?.[field] || ""}
                        onChange={(e) => patchContact(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
                  <textarea
                    className="textarea mt-1 min-h-[120px]"
                    value={draft?.summary || ""}
                    onChange={(e) => patchDraft({ summary: e.target.value })}
                    placeholder="Professional summary…"
                  />
                </div>
              </div>
            )}

            {activeSection === "experience" && (
              <div className="space-y-4">
                {(draft?.experience || []).map((exp, i) => (
                  <div key={i} className="card space-y-3 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Role {i + 1}</span>
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() =>
                          patchDraft({
                            experience: (draft?.experience || []).filter((_, idx) => idx !== i),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="input"
                        placeholder="Job title"
                        value={exp.title || ""}
                        onChange={(e) => {
                          const next = [...(draft?.experience || [])];
                          next[i] = { ...next[i], title: e.target.value };
                          patchDraft({ experience: next });
                        }}
                      />
                      <input
                        className="input"
                        placeholder="Company"
                        value={exp.company || ""}
                        onChange={(e) => {
                          const next = [...(draft?.experience || [])];
                          next[i] = { ...next[i], company: e.target.value };
                          patchDraft({ experience: next });
                        }}
                      />
                      <input
                        className="input"
                        placeholder="Start date"
                        value={exp.start_date || ""}
                        onChange={(e) => {
                          const next = [...(draft?.experience || [])];
                          next[i] = { ...next[i], start_date: e.target.value };
                          patchDraft({ experience: next });
                        }}
                      />
                      <input
                        className="input"
                        placeholder="End date"
                        value={exp.end_date || ""}
                        onChange={(e) => {
                          const next = [...(draft?.experience || [])];
                          next[i] = { ...next[i], end_date: e.target.value };
                          patchDraft({ experience: next });
                        }}
                      />
                    </div>
                    <textarea
                      className="textarea min-h-[100px]"
                      placeholder="One bullet per line"
                      value={(exp.bullets || []).join("\n")}
                      onChange={(e) => {
                        const next = [...(draft?.experience || [])];
                        next[i] = {
                          ...next[i],
                          bullets: e.target.value.split("\n"),
                        };
                        patchDraft({ experience: next });
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-outline w-full"
                  onClick={() => patchDraft({ experience: [...(draft?.experience || []), emptyExperience()] })}
                >
                  + Add experience
                </button>
              </div>
            )}

            {activeSection === "education" && (
              <div className="space-y-4">
                {(draft?.education || []).map((edu, i) => (
                  <div key={i} className="card space-y-3 p-4">
                    <input
                      className="input"
                      placeholder="Degree"
                      value={edu.degree || ""}
                      onChange={(e) => {
                        const next = [...(draft?.education || [])];
                        next[i] = { ...next[i], degree: e.target.value };
                        patchDraft({ education: next });
                      }}
                    />
                    <input
                      className="input"
                      placeholder="Institution"
                      value={edu.institution || ""}
                      onChange={(e) => {
                        const next = [...(draft?.education || [])];
                        next[i] = { ...next[i], institution: e.target.value };
                        patchDraft({ education: next });
                      }}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="input"
                        placeholder="Graduation"
                        value={edu.graduation_date || ""}
                        onChange={(e) => {
                          const next = [...(draft?.education || [])];
                          next[i] = { ...next[i], graduation_date: e.target.value };
                          patchDraft({ education: next });
                        }}
                      />
                      <input
                        className="input"
                        placeholder="GPA (optional)"
                        value={edu.gpa || ""}
                        onChange={(e) => {
                          const next = [...(draft?.education || [])];
                          next[i] = { ...next[i], gpa: e.target.value };
                          patchDraft({ education: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-outline w-full"
                  onClick={() => patchDraft({ education: [...(draft?.education || []), emptyEducation()] })}
                >
                  + Add education
                </button>
              </div>
            )}

            {activeSection === "skills" && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
                <textarea
                  className="textarea mt-1 min-h-[120px]"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Python, SQL, React, …"
                />
              </div>
            )}

            {activeSection === "linkedin" && (
              <div className="space-y-4">
                <UploadZone
                  accept=".pdf,.docx,.txt"
                  label="Upload LinkedIn PDF export (optional)"
                  onFile={async (file) => {
                    try {
                      const data = (await analyzeLinkedInFile(file)) as any;
                      if (data.extracted_text_preview) setLinkedinText(data.extracted_text_preview);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "LinkedIn PDF import failed");
                    }
                  }}
                />
                <textarea
                  rows={8}
                  value={linkedinText}
                  onChange={(e) => setLinkedinText(e.target.value)}
                  className="textarea"
                  placeholder="Paste LinkedIn headline, About, and Experience text…"
                />
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={loading || !draft?.resume_raw_text}
                  className="btn-primary w-full"
                >
                  {loading ? "Running AI optimization…" : "Run optimization"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {proposal && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-muted p-3">
                      <input
                        type="checkbox"
                        checked={asciiSafeExport}
                        onChange={(e) => setAsciiSafeExport(e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">ASCII-safe export for legacy ATS</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <a href={getResumeDownloadUrl(proposal.id, asciiSafeExport)} className="btn-primary" download>
                        Download resume
                      </a>
                      {proposal.linkedin_pack_path && (
                        <a href={getLinkedInPackDownloadUrl(proposal.id, asciiSafeExport)} className="btn-secondary" download>
                          LinkedIn pack
                        </a>
                      )}
                    </div>
                    {proposal.resume_score && (
                      <div className="card">
                        <div className="flex flex-wrap justify-around gap-4">
                          <ScoreRing label="Overall" value={proposal.resume_score.overall} size={100} />
                          <ScoreRing label="Keywords" value={proposal.resume_score.keywords} size={72} accent="#0d9488" />
                          <ScoreRing label="Impact" value={proposal.resume_score.impact} size={72} accent="#6366f1" />
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

        <div className="w-full overflow-auto bg-surface-muted p-4 sm:p-6 lg:w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live preview</h2>
            <Link href="/templates" className="text-xs text-brand-600 hover:underline">
              Change layout →
            </Link>
          </div>
          <ResumePreview profile={previewProfile} />
        </div>
      </div>
    </div>
  );
}
