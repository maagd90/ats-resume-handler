"use client";

import ComparisonTable from "@/components/marketing/ComparisonTable";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import SiteFooter from "@/components/marketing/SiteFooter";
import { createCheckout, devUpgradePrime, fetchBillingPlans, fetchMembership } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { showDevTools } from "@/lib/devTools";
import { FAQ_ITEMS } from "@/lib/marketing/faqData";
import { safeStripeCheckoutUrl } from "@/lib/security";
import Link from "next/link";
import { useEffect, useState } from "react";

const PRICING_FAQ = FAQ_ITEMS.filter((f) =>
  ["Prime a subscription", "difference between Free", "refund"].some((k) => f.question.includes(k.split(" ")[0]) || f.question.toLowerCase().includes(k))
);

export default function PricingPage() {
  const [membership, setMembership] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") setMessage("Payment successful! Your Prime access is now active.");
    if (params.get("canceled") === "1") setMessage("Checkout canceled.");
  }, []);

  useEffect(() => {
    fetchBillingPlans()
      .then((data) => {
        setPlans(data.plans || []);
        setStripeConfigured(Boolean(data.stripe_configured));
      })
      .catch(() => {});
    if (isLoggedIn()) fetchMembership().then(setMembership).catch(() => {});
  }, []);

  async function handleCheckout(planId: string) {
    if (!isLoggedIn()) {
      window.location.href = "/login?register=1";
      return;
    }
    setLoadingPlan(planId);
    try {
      const { checkout_url } = await createCheckout(planId);
      const safeUrl = safeStripeCheckoutUrl(checkout_url);
      if (!safeUrl) throw new Error("Invalid checkout redirect");
      window.location.href = safeUrl;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function devUpgrade() {
    await devUpgradePrime();
    setMembership(await fetchMembership());
    setMessage("Dev Prime activated for 90 days.");
  }

  const content = (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <section>
        <h1 className="text-3xl font-bold text-foreground">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          All plans include platform AI. Prime is a <strong className="text-foreground">one-time charge</strong> for
          your chosen term — no auto-renewal. Access continues until your term expires, then reverts to Free.
        </p>
        {membership && (
          <p className="mt-2 text-sm text-brand-600 dark:text-brand-400">
            Current plan: {membership.billing_plan || membership.tier}
            {membership.prime_expires_at && ` · active until ${new Date(membership.prime_expires_at).toLocaleDateString()}`}
          </p>
        )}
        {message && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h2 className="text-xl font-bold text-foreground">Free</h2>
          <p className="mt-2 text-3xl font-bold text-foreground">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>3 optimizations / month</li>
            <li>ATS scoring + guidance</li>
            <li>LinkedIn optimizer</li>
            <li>Word export</li>
          </ul>
          <Link href="/login?register=1" className="btn-secondary mt-6 inline-block w-full text-center">
            Get started free
          </Link>
        </div>

        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card relative ${plan.months === 6 ? "border-brand-400 ring-2 ring-brand-200 dark:ring-brand-800" : "border-brand-200"}`}
          >
            {plan.months === 6 && (
              <span className="badge badge-prime absolute -top-3 right-4">Most popular</span>
            )}
            <h2 className="text-xl font-bold text-brand-700 dark:text-brand-400">{plan.label}</h2>
            <p className="mt-2 text-3xl font-bold text-foreground">
              ${plan.price_usd.toFixed(2)}
              <span className="text-base font-normal text-muted-foreground"> / {plan.months} mo</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">${plan.monthly_equivalent.toFixed(2)}/mo · AI included</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Unlimited optimizations</li>
              <li>Job automation + Review Mode</li>
              <li>JD tailoring + cover letters</li>
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(plan.id)}
              disabled={!stripeConfigured || loadingPlan === plan.id}
              className="btn-primary mt-6 w-full"
            >
              {loadingPlan === plan.id ? "Redirecting…" : "Get Prime"}
            </button>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold text-foreground">Compare plans</h2>
        <div className="mt-4">
          <ComparisonTable />
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Refunds: contact support within 7 days if no automated applications were sent.{" "}
        <Link href="/refund" className="text-brand-600 hover:underline dark:text-brand-400">
          Full refund policy →
        </Link>
      </p>

      <section>
        <h2 className="text-xl font-bold text-foreground">Pricing FAQ</h2>
        <div className="mt-4">
          <FaqAccordion items={FAQ_ITEMS.filter((f) => ["Prime", "Free", "refund", "OpenAI"].some((k) => f.question.includes(k)))} />
        </div>
      </section>

      {!stripeConfigured && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Stripe is not configured yet. Set STRIPE_SECRET_KEY in backend .env to enable payments.
        </p>
      )}

      {isLoggedIn() && showDevTools() && (
        <div className="card">
          <p className="text-sm text-muted-foreground">Development only (NEXT_PUBLIC_ENABLE_DEV_TOOLS=true):</p>
          <button type="button" onClick={devUpgrade} className="btn-secondary mt-2">
            Activate Prime (dev)
          </button>
        </div>
      )}
    </div>
  );

  if (isLoggedIn()) return content;

  return (
    <div className="min-h-screen bg-surface">
      {content}
      <SiteFooter />
    </div>
  );
}
