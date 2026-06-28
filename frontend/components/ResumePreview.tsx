type Profile = {
  contact?: { name?: string; email?: string; phone?: string; linkedin_url?: string };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    start_date?: string;
    end_date?: string;
    bullets?: string[];
  }>;
  education?: Array<{ degree?: string; institution?: string }>;
};

export default function ResumePreview({ profile, compact = false }: { profile?: Profile | null; compact?: boolean }) {
  if (!profile?.contact?.name && !profile?.summary && !profile?.experience?.length) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center ${compact ? "min-h-[320px] p-6" : "min-h-[480px] p-10"}`}>
        <div className="h-24 w-20 rounded border border-slate-200 bg-slate-50 shadow-sm" />
        <p className="mt-4 text-sm font-medium text-slate-600">Resume preview</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">Upload a resume to see a live preview of your ATS-formatted document.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel ${compact ? "max-h-[480px]" : ""}`}>
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
        <p className="text-xs font-medium text-slate-500">Live preview · Calibri ATS template</p>
      </div>
      <div className={`resume-preview-doc overflow-y-auto ${compact ? "max-h-[440px] text-[10px]" : "max-h-[560px]"}`}>
        <h1>{profile.contact?.name || "Your Name"}</h1>
        <p className="mt-1 text-slate-600">
          {[profile.contact?.phone, profile.contact?.email, profile.contact?.linkedin_url].filter(Boolean).join(" · ")}
        </p>

        {profile.summary && (
          <>
            <h2>Summary</h2>
            <p className="mt-1">{profile.summary}</p>
          </>
        )}

        {profile.experience && profile.experience.length > 0 && (
          <>
            <h2>Experience</h2>
            {profile.experience.slice(0, 4).map((exp, i) => (
              <div key={i} className="mt-2">
                <p className="font-semibold text-slate-900">
                  {exp.title} | {exp.company}
                  {exp.start_date && ` | ${exp.start_date}${exp.end_date ? ` – ${exp.end_date}` : ""}`}
                </p>
                <ul className="mt-0.5 list-none space-y-0.5 pl-0">
                  {(exp.bullets || []).slice(0, 3).map((b, j) => (
                    <li key={j}>- {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {profile.education && profile.education.length > 0 && (
          <>
            <h2>Education</h2>
            {profile.education.slice(0, 2).map((edu, i) => (
              <p key={i} className="mt-1">
                {edu.degree} | {edu.institution}
              </p>
            ))}
          </>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <h2>Skills</h2>
            <p className="mt-1">{profile.skills.slice(0, 15).join(", ")}</p>
          </>
        )}
      </div>
    </div>
  );
}
