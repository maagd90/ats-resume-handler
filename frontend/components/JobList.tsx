import { safeHref } from "@/lib/security";

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  apply_link?: string;
  fit_score?: number;
  gap_analysis?: { matched_skills?: string[]; missing_skills?: string[] };
};

export default function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return <p className="text-sm text-slate-500">No jobs found. Try another search.</p>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <article key={job.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
              <p className="text-sm text-slate-600">
                {job.company}
                {job.location ? ` · ${job.location}` : ""}
              </p>
            </div>
            {typeof job.fit_score === "number" && (
              <div className="rounded-lg bg-brand-50 px-3 py-2 text-center">
                <p className="text-xs text-brand-700">Fit Score</p>
                <p className="text-xl font-bold text-brand-700">{job.fit_score.toFixed(1)}</p>
              </div>
            )}
          </div>
          <p className="mt-3 line-clamp-4 text-sm text-slate-600">{job.description}</p>
          {job.gap_analysis && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-green-700">Matched Skills</p>
                <p className="mt-1 text-sm text-slate-600">
                  {(job.gap_analysis.matched_skills || []).join(", ") || "None detected"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Missing Skills</p>
                <p className="mt-1 text-sm text-slate-600">
                  {(job.gap_analysis.missing_skills || []).join(", ") || "None detected"}
                </p>
              </div>
            </div>
          )}
          {safeHref(job.apply_link) && (
            <a
              href={safeHref(job.apply_link)!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              View application →
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
