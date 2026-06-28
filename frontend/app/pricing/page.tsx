"use client";

import { createCheckout, fetchBillingPlans, fetchMembership } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const [membership, setMembership] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setMessage("Payment successful! Your Prime access is now active.");
    }
    if (params.get("canceled") === "1") {
      setMessage("Checkout canceled.");
    }
  }, []);

  useEffect(() => {
    fetchBillingPlans()
      .then((data) => {
        setPlans(data.plans || []);
        setStripeConfigured(Boolean(data.stripe_configured));
      })
      .catch(() => {});
    if (getAccessToken()) {
      fetchMembership().then(setMembership).catch(() => {});
    }
  }, []);

  async function handleCheckout(planId: string) {
    if (!getAccessToken()) {
      window.location.href = "/login?register=1";
      return;
    }
    setLoadingPlan(planId);
    try {
      const { checkout_url } = await createCheckout(planId);
      window.location.href = checkout_url;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function devUpgrade() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/membership/upgrade-dev`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    const m = await fetchMembership();
    setMembership(m);
    setMessage("Dev Prime activated for 90 days.");
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Pricing</h1>
        <p className="mt-2 text-slate-600">
          All plans include platform AI — resume optimization, tailoring, and cover letters. You never provide an API key.
        </p>
        {membership && (
          <p className="mt-2 text-sm text-brand-600">
            Current plan: {membership.billing_plan || membership.tier}
            {membership.prime_expires_at && ` · expires ${new Date(membership.prime_expires_at).toLocaleDateString()}`}
          </p>
        )}
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>3 profile optimizations / month</li>
            <li>ATS scoring + impact checklist</li>
            <li>LinkedIn guidance panel</li>
            <li>Word + ASCII-safe downloads</li>
            <li>Platform AI included</li>
          </ul>
          <Link href="/login?register=1" className="btn-secondary mt-6 inline-block w-full text-center">
            Get started free
          </Link>
        </div>

        {plans.map((plan) => (
          <div key={plan.id} className="card border-brand-200 ring-2 ring-brand-100">
            <h2 className="text-xl font-bold text-brand-700">{plan.label}</h2>
            <p className="mt-2 text-3xl font-bold">
              ${plan.price_usd.toFixed(2)}
              <span className="text-base font-normal text-slate-500"> / {plan.months} mo</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">${plan.monthly_equivalent.toFixed(2)}/mo · AI cost included</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Unlimited optimizations</li>
              <li>24/7 job-hunting agent</li>
              <li>JD-specific resume tailoring</li>
              <li>Cover letters + auto-apply</li>
            </ul>
            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={!stripeConfigured || loadingPlan === plan.id}
              className="btn-primary mt-6 w-full"
            >
              {loadingPlan === plan.id ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>

      {!stripeConfigured && (
        <p className="text-sm text-amber-700">
          Stripe is not configured yet. Set STRIPE_SECRET_KEY in backend .env to enable payments.
        </p>
      )}

      {getAccessToken() && process.env.NODE_ENV === "development" && (
        <div className="card">
          <p className="text-sm text-slate-600">Development only:</p>
          <button onClick={devUpgrade} className="btn-secondary mt-2">
            Activate Prime (dev)
          </button>
        </div>
      )}
    </div>
  );
}
