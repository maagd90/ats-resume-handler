"use client";

import BrandLogo from "@/components/BrandLogo";
import LegalNote from "@/components/LegalNote";
import ComparisonTable from "@/components/marketing/ComparisonTable";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import SiteFooter from "@/components/marketing/SiteFooter";
import Testimonials from "@/components/marketing/Testimonials";
import TrustStrip from "@/components/marketing/TrustStrip";
import ScoreRing from "@/components/ScoreRing";
import ThemeToggle from "@/components/ThemeToggle";
import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/brand";
import { FAQ_ITEMS } from "@/lib/marketing/faqData";
import { FEATURE_DEEP_DIVE } from "@/lib/marketing/features";
import Link from "next/link";

const STEPS = [
  { step: "1", title: "Upload", body: "Drop your existing resume or start from a blank profile after sign-up." },
  { step: "2", title: "Improve", body: "Fix sections, run AI optimization, and pick an original PassATS layout preset." },
  { step: "3", title: "Apply", body: "Download, use LinkedIn guidance, or upgrade to Prime for responsible job automation." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLogo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">Layouts</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <ThemeToggle />
            <Link href="/login" className="btn-outline text-sm">Sign in</Link>
            <Link href="/login?register=1" className="btn-primary text-sm">Create account</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-border bg-gradient-to-b from-brand-50/80 to-surface py-16 dark:from-brand-950/40 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              {PRODUCT_NAME}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Resumes that machines and humans can read
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{PRODUCT_DESCRIPTION}</p>
            <p className="mt-3 text-sm text-brand-700 dark:text-brand-300">Healthy ATS target: 75–80% — not 100%.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?register=1" className="btn-primary px-6 py-3">Start free</Link>
              <Link href="/templates" className="btn-secondary px-6 py-3">Browse layouts</Link>
            </div>
          </div>
          <div className="card flex flex-col items-center justify-center py-10 motion-safe:animate-none">
            <ScoreRing label="Sample ATS score" value={78} size={140} />
            <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground">
              Live scoring for parseability, keywords, structure, and impact — with guidance on what to fix next.
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section id="how" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="card">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">Built for ATS workflows</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_DEEP_DIVE.map((f) => (
              <div key={f.title} className="card border-t-2 border-t-brand-600">
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">Free vs Prime</h2>
          <div className="mt-8">
            <ComparisonTable />
          </div>
          <div className="mt-6 text-center">
            <Link href="/pricing" className="btn-primary">View pricing</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">What users say</h2>
          <div className="mt-8">
            <Testimonials />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
          <div className="mt-8">
            <FaqAccordion items={FAQ_ITEMS.slice(0, 5)} />
          </div>
          <Link href="/faq" className="mt-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400">
            View all questions →
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Free tier includes monthly optimizations and platform AI. No API keys required.
          </p>
          <Link href="/login?register=1" className="btn-primary mt-8 inline-flex px-8 py-3">
            Create free account
          </Link>
          <LegalNote className="mx-auto mt-10 max-w-2xl text-left" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
