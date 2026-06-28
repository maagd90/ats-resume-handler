"use client";

import { useEffect, useState } from "react";
import { fetchApplications, approveApplication, skipApplication, retryApplication } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-green-100 text-green-700",
  queued: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-slate-100 text-slate-600",
  preparing: "bg-purple-100 text-purple-700",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchApplications(filter || undefined);
      setApplications(data as any[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleAction(id: string, action: "approve" | "skip" | "retry") {
    if (action === "approve") await approveApplication(id);
    if (action === "skip") await skipApplication(id);
    if (action === "retry") await retryApplication(id);
    await load();
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
        <p className="mt-2 text-slate-600">Track, approve, and manage all job applications.</p>
      </section>

      <section className="card">
        <label className="text-sm font-medium text-slate-700">Filter by status</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input mt-2 max-w-xs">
          <option value="">All</option>
          <option value="queued">Queued</option>
          <option value="applied">Applied</option>
          <option value="failed">Failed</option>
          <option value="ready">Ready</option>
          <option value="skipped">Skipped</option>
        </select>
      </section>

      {loading ? (
        <p className="text-slate-600">Loading applications...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Fit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{app.job_title}</td>
                  <td className="px-4 py-3">{app.company}</td>
                  <td className="px-4 py-3">{app.fit_score?.toFixed?.(1) ?? app.fit_score}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] || "bg-slate-100"}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{app.apply_method || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => setSelected(app)} className="btn-secondary text-xs">View</button>
                      {["queued", "ready"].includes(app.status) && (
                        <button onClick={() => handleAction(app.id, "approve")} className="btn-primary text-xs">Approve</button>
                      )}
                      {app.status === "failed" && (
                        <button onClick={() => handleAction(app.id, "retry")} className="btn-secondary text-xs">Retry</button>
                      )}
                      {!["applied", "skipped"].includes(app.status) && (
                        <button onClick={() => handleAction(app.id, "skip")} className="btn-secondary text-xs">Skip</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!applications.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No applications yet. Start the agent to begin searching.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <section className="card">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold">{selected.job_title} at {selected.company}</h2>
            <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
          </div>
          <p className="mt-2 text-sm text-slate-600">Fit score: {selected.fit_score}</p>
          {selected.job_url && (
            <a href={selected.job_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
              Open job posting →
            </a>
          )}
          {selected.cover_letter_text && (
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              {selected.cover_letter_text}
            </pre>
          )}
          {selected.error_message && (
            <p className="mt-4 text-sm text-red-600">{selected.error_message}</p>
          )}
        </section>
      )}
    </div>
  );
}
