"use client";

import AutoApplyConsent from "@/components/AutoApplyConsent";
import LegalNote from "@/components/LegalNote";
import { useEffect, useState } from "react";
import { fetchCriteria, updateCriteria } from "@/lib/api";

const MATCH_PRESETS = [
  { label: "Conservative (85+)", value: 85 },
  { label: "Balanced (75+)", value: 75 },
  { label: "Aggressive (60+)", value: 60 },
];

export default function CriteriaSettingsPage() {
  const [criteria, setCriteria] = useState<any>(null);
  const [titles, setTitles] = useState("");
  const [locations, setLocations] = useState("");
  const [skills, setSkills] = useState("");
  const [excludedKeywords, setExcludedKeywords] = useState("");
  const [excludedCompanies, setExcludedCompanies] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    fetchCriteria()
      .then((data: any) => {
        setCriteria(data);
        setTitles((data.job_titles || []).join(", "));
        setLocations((data.locations || []).join(", "));
        setSkills((data.required_skills || []).join(", "));
        setExcludedKeywords((data.excluded_keywords || []).join(", "));
        setExcludedCompanies((data.excluded_companies || []).join(", "));
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : "Could not load criteria"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (criteria.auto_apply_enabled && !consent) {
      setMessage("Confirm the auto-apply disclosure before enabling automation.");
      return;
    }
    try {
      const updated = await updateCriteria({
        job_titles: titles.split(",").map((s) => s.trim()).filter(Boolean),
        locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
        required_skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        excluded_keywords: excludedKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        excluded_companies: excludedCompanies.split(",").map((s) => s.trim()).filter(Boolean),
        remote_only: criteria.remote_only,
        min_fit_score: Number(criteria.min_fit_score),
        max_applications_per_day: Number(criteria.max_applications_per_day),
        require_approval: criteria.require_approval,
        auto_apply_enabled: criteria.auto_apply_enabled,
        search_interval_hours: Number(criteria.search_interval_hours),
      });
      setCriteria(updated);
      setMessage("Criteria saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading criteria…</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-foreground">Job criteria</h1>
        <p className="mt-2 text-muted-foreground">Configure search targets and safe automation defaults.</p>
      </section>

      <div className="card border-brand-600/20 bg-brand-50/30 dark:bg-brand-950/20">
        <h2 className="font-semibold text-foreground">Account safety</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Automated applying can carry platform risk. PassATS mitigates with Review Mode (default on), daily caps, match
          strictness, and preferring company career pages. You remain responsible for each submission.
        </p>
      </div>

      <form onSubmit={handleSave} className="card space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground">Job titles (comma-separated)</label>
          <input value={titles} onChange={(e) => setTitles(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Locations (comma-separated)</label>
          <input value={locations} onChange={(e) => setLocations(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Required skills (comma-separated)</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Excluded keywords</label>
          <input value={excludedKeywords} onChange={(e) => setExcludedKeywords(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Excluded companies</label>
          <input value={excludedCompanies} onChange={(e) => setExcludedCompanies(e.target.value)} className="input mt-2" />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="font-medium text-foreground">Review Mode (recommended)</h3>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.require_approval}
              onChange={(e) => setCriteria({ ...criteria, require_approval: e.target.checked })}
              className="mt-1"
            />
            <span>Require my approval before any application is submitted. Queued items appear on Applications.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.auto_apply_enabled}
              onChange={(e) => setCriteria({ ...criteria, auto_apply_enabled: e.target.checked })}
              className="mt-1"
            />
            <span>Enable job search automation (Prime). Prepares matches on a schedule — still respects Review Mode.</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.remote_only}
              onChange={(e) => setCriteria({ ...criteria, remote_only: e.target.checked })}
            />
            Remote only
          </label>
        </div>

        {criteria.auto_apply_enabled && <AutoApplyConsent checked={consent} onChange={setConsent} />}

        <div>
          <label className="text-sm font-medium text-foreground">Match strictness</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {MATCH_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setCriteria({ ...criteria, min_fit_score: p.value })}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  criteria.min_fit_score === p.value
                    ? "border-brand-600 bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-100"
                    : "border-border text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={criteria.min_fit_score}
            onChange={(e) => setCriteria({ ...criteria, min_fit_score: Number(e.target.value) })}
            className="mt-3 w-full"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Max applications / day</label>
            <p className="text-xs text-muted-foreground">Quality over volume — 5–15/day recommended</p>
            <input
              type="number"
              min={1}
              max={25}
              value={criteria.max_applications_per_day}
              onChange={(e) => setCriteria({ ...criteria, max_applications_per_day: Number(e.target.value) })}
              className="input mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Search interval (hours)</label>
            <input
              type="number"
              min={1}
              max={24}
              value={criteria.search_interval_hours}
              onChange={(e) => setCriteria({ ...criteria, search_interval_hours: Number(e.target.value) })}
              className="input mt-2"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">Save criteria</button>
        {message && <p className="text-sm text-brand-700 dark:text-brand-300">{message}</p>}
      </form>

      <LegalNote variant="autoApply" />
    </div>
  );
}
