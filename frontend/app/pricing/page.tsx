"use client";

import { useEffect, useState } from "react";
import { fetchMembership } from "@/lib/api";

export default function PricingPage() {
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    fetchMembership().then(setMembership).catch(() => {});
  }, []);

  async function devUpgrade() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/membership/upgrade-dev`, {
      method: "POST",
    });
    const m = await fetchMembership();
    setMembership(m);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Pricing</h1>
        <p className="mt-2 text-slate-600">Free profile optimization for everyone. Prime unlocks the 24/7 job-hunting agent.</p>
        {membership && (
          <p className="mt-2 text-sm text-brand-600">Current plan: {membership.tier}</p>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>3 profile optimizations per month</li>
            <li>ATS resume scoring + issues</li>
            <li>LinkedIn optimization suggestions</li>
            <li>Guided side panel (how to update LinkedIn)</li>
            <li>Download Word resume + LinkedIn pack</li>
            <li>Anti-hallucination fact checking</li>
          </ul>
        </div>
        <div className="card border-brand-200 ring-2 ring-brand-100">
          <h2 className="text-xl font-bold text-brand-700">Prime</h2>
          <p className="mt-2 text-3xl font-bold">$9.99<span className="text-base font-normal text-slate-500">/mo</span></p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Unlimited profile optimizations</li>
            <li>24/7 autonomous job search agent</li>
            <li>JD-specific resume tailoring per job</li>
            <li>Unique cover letter per application</li>
            <li>Auto-apply (email + browser forms)</li>
            <li>Applications dashboard</li>
          </ul>
          <button onClick={devUpgrade} className="btn-primary mt-6 w-full">
            Upgrade to Prime (dev)
          </button>
          <p className="mt-2 text-xs text-slate-400">Stripe checkout coming soon. Coins payment also planned.</p>
        </div>
      </div>
    </div>
  );
}
