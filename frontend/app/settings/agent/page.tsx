"use client";

import { useEffect, useState } from "react";
import { fetchAgentStatus, startAgent, stopAgent, runAgentNow } from "@/lib/api";

export default function AgentSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = (await fetchAgentStatus()) as any;
      setStatus(data.status);
      setActivity(data.activity || []);
    } catch {
      /* agent status is available without Prime */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const [error, setError] = useState("");

  async function toggle() {
    setError("");
    try {
      if (status?.is_running) await stopAgent();
      else await startAgent();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent control requires Prime — click Enable Prime (dev) in the header.");
    }
  }

  async function triggerNow() {
    setError("");
    try {
      await runAgentNow();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run now requires Prime.");
    }
  }

  if (loading) return <p className="text-slate-600">Loading agent settings...</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Agent Settings</h1>
        <p className="mt-2 text-slate-600">Control the 24/7 autonomous job search and apply loop.</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className={`text-2xl font-bold ${status?.is_running ? "text-green-600" : "text-slate-400"}`}>
              {status?.is_running ? "Running 24/7" : "Paused"}
            </p>
            {status?.last_run_at && (
              <p className="mt-1 text-sm text-slate-600">Last run: {new Date(status.last_run_at).toLocaleString()}</p>
            )}
            {status?.next_run_at && (
              <p className="text-sm text-slate-600">Next run: {new Date(status.next_run_at).toLocaleString()}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={toggle} className={status?.is_running ? "btn-secondary" : "btn-primary"}>
              {status?.is_running ? "Pause Agent" : "Start Agent"}
            </button>
            <button onClick={triggerNow} className="btn-secondary">Run Now</button>
          </div>
        </div>
        {status?.last_error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Last error: {status.last_error}</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card text-center">
          <p className="text-sm text-slate-500">Found Today</p>
          <p className="text-3xl font-bold">{status?.stats?.jobs_found_today || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">Scored Today</p>
          <p className="text-3xl font-bold">{status?.stats?.jobs_scored_today || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">Applied Today</p>
          <p className="text-3xl font-bold text-green-600">{status?.stats?.applications_submitted_today || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">Failed Today</p>
          <p className="text-3xl font-bold text-red-600">{status?.stats?.applications_failed_today || 0}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">SMTP Configuration</h2>
        <p className="mt-2 text-sm text-slate-600">
          Set <code>SMTP_USER</code> and <code>SMTP_PASSWORD</code> in backend environment for Tier 1 email apply.
          Use a Gmail app password or your email provider&apos;s SMTP credentials.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
          {activity.map((item: any) => (
            <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
              <p>{item.message}</p>
            </li>
          ))}
          {!activity.length && <li className="text-slate-500">No activity yet.</li>}
        </ul>
      </section>
    </div>
  );
}
