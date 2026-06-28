"use client";

import { useEffect, useState } from "react";
import { fetchCriteria, updateCriteria } from "@/lib/api";

export default function CriteriaSettingsPage() {
  const [criteria, setCriteria] = useState<any>(null);
  const [titles, setTitles] = useState("");
  const [locations, setLocations] = useState("");
  const [skills, setSkills] = useState("");
  const [excludedKeywords, setExcludedKeywords] = useState("");
  const [excludedCompanies, setExcludedCompanies] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCriteria().then((data: any) => {
      setCriteria(data);
      setTitles((data.job_titles || []).join(", "));
      setLocations((data.locations || []).join(", "));
      setSkills((data.required_skills || []).join(", "));
      setExcludedKeywords((data.excluded_keywords || []).join(", "));
      setExcludedCompanies((data.excluded_companies || []).join(", "));
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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
    setMessage("Criteria saved successfully.");
  }

  if (loading) return <p className="text-slate-600">Loading criteria...</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Job Criteria</h1>
        <p className="mt-2 text-slate-600">Configure what jobs the agent searches for and when to apply.</p>
      </section>

      <form onSubmit={handleSave} className="card space-y-6">
        <div>
          <label className="text-sm font-medium">Job Titles (comma-separated)</label>
          <input value={titles} onChange={(e) => setTitles(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Locations (comma-separated)</label>
          <input value={locations} onChange={(e) => setLocations(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Required Skills (comma-separated)</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Keywords</label>
          <input value={excludedKeywords} onChange={(e) => setExcludedKeywords(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Companies</label>
          <input value={excludedCompanies} onChange={(e) => setExcludedCompanies(e.target.value)} className="input mt-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.remote_only}
              onChange={(e) => setCriteria({ ...criteria, remote_only: e.target.checked })}
            />
            Remote only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.require_approval}
              onChange={(e) => setCriteria({ ...criteria, require_approval: e.target.checked })}
            />
            Require approval before applying
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={criteria.auto_apply_enabled}
              onChange={(e) => setCriteria({ ...criteria, auto_apply_enabled: e.target.checked })}
            />
            Auto-apply enabled
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Min Fit Score ({criteria.min_fit_score})</label>
            <input
              type="range" min={0} max={100}
              value={criteria.min_fit_score}
              onChange={(e) => setCriteria({ ...criteria, min_fit_score: Number(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Applications / Day</label>
            <input
              type="number" min={1} max={50}
              value={criteria.max_applications_per_day}
              onChange={(e) => setCriteria({ ...criteria, max_applications_per_day: Number(e.target.value) })}
              className="input mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Search Interval (hours)</label>
            <input
              type="number" min={1} max={24}
              value={criteria.search_interval_hours}
              onChange={(e) => setCriteria({ ...criteria, search_interval_hours: Number(e.target.value) })}
              className="input mt-2"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">Save Criteria</button>
        {message && <p className="text-sm text-green-700">{message}</p>}
      </form>
    </div>
  );
}
