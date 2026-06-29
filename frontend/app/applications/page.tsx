"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApplications, approveApplication, skipApplication, retryApplication } from "@/lib/api";
import { safeHref } from "@/lib/security";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  queued: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ready: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  skipped: "bg-muted text-muted-foreground",
  preparing: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300",
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

  const queuedCount = applications.filter((a) => ["queued", "ready"].includes(a.status)).length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-foreground">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Track, approve, and manage job applications. With Review Mode on, queued items wait for your approval before submit.
        </p>
      </section>

      {queuedCount > 0 && (
        <section className="rounded-lg border border-brand-600/20 bg-brand-50/50 p-4 dark:bg-brand-950/20">
          <p className="font-medium text-foreground">
            {queuedCount} application{queuedCount === 1 ? "" : "s"} waiting for review
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve to submit, or skip to pass. You can change Review Mode in{" "}
            <Link href="/settings/criteria" className="text-brand-600 hover:underline dark:text-brand-400">
              job criteria
            </Link>
            .
          </p>
        </section>
      )}

      <section className="card">
        <label className="text-sm font-medium text-foreground">Filter by status</label>
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
        <p className="text-muted-foreground">Loading applications…</p>
      ) : !applications.length ? (
        <section className="card space-y-4 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">No applications yet</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            When automation finds matching roles, prepared applications appear here. With Review Mode enabled (recommended),
            you approve each one before it is sent.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/settings/criteria" className="btn-primary">
              Configure job criteria
            </Link>
            <Link href="/settings/agent" className="btn-secondary">
              Start automation
            </Link>
          </div>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted-foreground">
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
                <tr key={app.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{app.job_title}</td>
                  <td className="px-4 py-3 text-foreground">{app.company}</td>
                  <td className="px-4 py-3">{app.fit_score?.toFixed?.(1) ?? app.fit_score}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] || "bg-muted"}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{app.apply_method || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => setSelected(app)} className="btn-secondary text-xs">
                        View
                      </button>
                      {["queued", "ready"].includes(app.status) && (
                        <button onClick={() => handleAction(app.id, "approve")} className="btn-primary text-xs" aria-label={`Approve application for ${app.job_title}`}>
                          Approve
                        </button>
                      )}
                      {app.status === "failed" && (
                        <button onClick={() => handleAction(app.id, "retry")} className="btn-secondary text-xs">
                          Retry
                        </button>
                      )}
                      {!["applied", "skipped"].includes(app.status) && (
                        <button onClick={() => handleAction(app.id, "skip")} className="btn-secondary text-xs">
                          Skip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <section className="card">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {selected.job_title} at {selected.company}
            </h2>
            <button onClick={() => setSelected(null)} className="btn-secondary">
              Close
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Fit score: {selected.fit_score}</p>
          {safeHref(selected.job_url) && (
            <a
              href={safeHref(selected.job_url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              Open job posting →
            </a>
          )}
          {selected.cover_letter_text && (
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm text-slate-100 dark:bg-slate-950">
              {selected.cover_letter_text}
            </pre>
          )}
          {selected.error_message && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{selected.error_message}</p>}
        </section>
      )}
    </div>
  );
}
