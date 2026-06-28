"use client";

import BrandLogo from "@/components/BrandLogo";
import LegalNote from "@/components/LegalNote";
import ThemeToggle from "@/components/ThemeToggle";
import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/brand";
import Link from "next/link";

const CAPABILITIES = [
  {
    title: "Parse & score",
    description: "Upload PDF or DOCX. We extract structure and run ATS checks on parseability, keywords, and impact.",
  },
  {
    title: "Edit in browser",
    description: "Adjust contact info, roles, bullets, and skills with a live preview — then save drafts to your account.",
  },
  {
    title: "Export safely",
    description: "Download Word files using our original layout presets (Calibri/Arial/Helvetica, single-column, ATS-safe).",
  },
];

const STEPS = [
  { step: "1", title: "Upload", body: "Drop your existing resume or start from a blank profile after sign-up." },
  { step: "2", title: "Improve", body: "Fix sections, run AI optimization, and pick an original PassATS layout preset." },
  { step: "3", title: "Apply", body: "Download, use LinkedIn guidance, or upgrade to Prime for autonomous job search." },
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

      <section className="border-b border-border bg-gradient-to-b from-brand-50/80 to-surface py-20 dark:from-brand-950/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              {PRODUCT_NAME}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Resumes that machines and humans can read
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{PRODUCT_DESCRIPTION}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?register=1" className="btn-primary px-6 py-3">Start free</Link>
              <Link href="/templates" className="btn-secondary px-6 py-3">Browse layout presets</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="card">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Built for ATS workflows</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Free tier includes monthly optimizations and platform AI. No API keys required.
          </p>
          <Link href="/login?register=1" className="btn-primary mt-8 inline-flex px-8 py-3">
            Create free account
          </Link>
          <LegalNote className="mx-auto mt-10 max-w-2xl text-left" />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {PRODUCT_NAME}</p>
        </div>
      </footer>
    </div>
  );
}
