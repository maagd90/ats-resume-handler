"use client";

import AutoApplyConsent from "@/components/AutoApplyConsent";
import LegalNote from "@/components/LegalNote";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAgentStatus, startAgent, stopAgent, runAgentNow } from "@/lib/api";

export default function AgentSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  async function load() {
    try {
      const data = (await fetchAgentStatus()) as any;
      setStatus(data.status);
      setActivity(data.activity || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    setError("");
    if (!status?.is_running && !consent) {
      setError("Please confirm the auto-apply disclosure before starting.");
      return;
    }
    try {
      if (status?.is_running) await stopAgent();
      else await startAgent();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Automation requires Prime membership.");
    }
  }

  async function triggerNow() {
    setError("");
    if (!consent) {
      setError("Please confirm the auto-apply disclosure first.");
      return;
    }
    try {
      await runAgentNow();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run now requires Prime.");
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading automation settings…</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-foreground">Job automation</h1>
        <p className="mt-2 text-muted-foreground">
          Search, score, and prepare applications. Review Mode is on by default — you approve before anything is sent.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-foreground">Activity log</h2>
        <p className="mt-1 text-sm text-muted-foreground">See exactly what was prepared, queued, or submitted.</p>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {activity.map((item: any) => (
            <li key={item.id} className="rounded-lg bg-surface-muted px-3 py-2 dark:bg-slate-800">
              <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
              <p className="text-foreground">{item.message}</p>
            </li>
          ))}
          {!activity.length && (
            <li className="text-muted-foreground">
              No activity yet.{" "}
              <Link href="/settings/criteria" className="text-brand-600 hover:underline">
                Set job criteria
              </Link>{" "}
              first, then start automation.
            </li>
          )}
        </ul>
      </section>

      <AutoApplyConsent checked={consent} onChange={setConsent} />

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`text-2xl font-bold ${status?.is_running ? "text-green-600" : "text-muted-foreground"}`}>
              {status?.is_running ? "Running" : "Paused"}
            </p>
            {status?.last_run_at && (
              <p className="mt-1 text-sm text-muted-foreground">Last run: {new Date(status.last_run_at).toLocaleString()}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggle} className={status?.is_running ? "btn-secondary" : "btn-primary"} aria-label={status?.is_running ? "Pause automation" : "Start automation"}>
              {status?.is_running ? "Pause" : "Start"}
            </button>
            <button type="button" onClick={triggerNow} className="btn-secondary" aria-label="Run automation now">
              Run now
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Found today", status?.stats?.jobs_found_today],
          ["Scored today", status?.stats?.jobs_scored_today],
          ["Applied today", status?.stats?.applications_submitted_today],
          ["Failed today", status?.stats?.applications_failed_today],
        ].map(([label, val]) => (
          <div key={label as string} className="card text-center">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{val || 0}</p>
          </div>
        ))}
      </section>

      <LegalNote variant="autoApply" />
    </div>
  );
}
