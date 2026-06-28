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

export default function ResumePreview({ profile }: { profile?: Profile | null; compact?: boolean }) {
  if (!profile?.contact?.name && !profile?.summary && !profile?.experience?.length) {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-10 text-center">
        <div className="mb-4 h-24 w-20 rounded border border-gray-200 bg-gray-50 shadow-sm" />
        <p className="text-sm font-medium text-gray-600">Resume preview</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Upload a resume to see a live preview of your ATS-formatted document.
        </p>
      </div>
    );
  }

  return (
    <div className="resume-preview-doc mx-auto max-w-4xl shadow-lg">
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1>{profile.contact?.name || "Your Name"}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {profile.contact?.email && <span>{profile.contact.email}</span>}
          {profile.contact?.phone && <span>{profile.contact.phone}</span>}
          {profile.contact?.linkedin_url && <span>{profile.contact.linkedin_url}</span>}
        </div>
      </div>

      {profile.summary && (
        <div className="mb-6">
          <h2>Professional Summary</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{profile.summary}</p>
        </div>
      )}

      {profile.experience && profile.experience.length > 0 && (
        <div className="mb-6">
          <h2>Experience</h2>
          <div className="mt-3 space-y-4">
            {profile.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900">{exp.title}</h3>
                  {(exp.start_date || exp.end_date) && (
                    <span className="text-sm text-gray-600">
                      {exp.start_date}
                      {exp.end_date ? ` – ${exp.end_date}` : ""}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{exp.company}</p>
                <ul className="mt-1 space-y-0.5 text-sm leading-relaxed text-gray-700">
                  {(exp.bullets || []).map((b, j) => (
                    <li key={j} className="whitespace-pre-line">{b.startsWith("•") || b.startsWith("-") ? b : `• ${b}`}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education && profile.education.length > 0 && (
        <div className="mb-6">
          <h2>Education</h2>
          {profile.education.map((edu, i) => (
            <div key={i} className="mt-2">
              <h3 className="font-medium text-gray-900">{edu.degree}</h3>
              <p className="text-gray-700">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h2>Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills.slice(0, 20).map((skill) => (
              <span key={skill} className="badge bg-gray-100 text-sm text-gray-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
