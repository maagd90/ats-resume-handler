"use client";

import Link from "next/link";
import { IconResume } from "@/components/icons";

const FEATURES = [
  {
    title: "AI Suggestions",
    description: "Get intelligent recommendations for better bullet points and content optimization.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: "ATS-Friendly",
    description: "All templates are designed to pass Applicant Tracking Systems successfully.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Preview",
    description: "See your resume update instantly as you type with our live preview feature.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    content: "This resume builder helped me land my dream job. The AI suggestions were incredibly helpful!",
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "Meta",
    content: "Clean, professional templates that actually work. Got 3x more interview calls after using this.",
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Netflix",
    content: "The ATS-friendly feature is a game changer. Finally, a builder that understands modern hiring.",
  },
];

const TEMPLATES = [
  { name: "Modern Professional", description: "Clean and contemporary design" },
  { name: "Executive Classic", description: "Traditional layout for senior roles" },
  { name: "Creative Portfolio", description: "Showcase your creative work" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <IconResume className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-semibold text-gray-900">ResumeBuilder</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition hover:text-gray-900">Features</a>
            <a href="#templates" className="text-sm text-muted-foreground transition hover:text-gray-900">Templates</a>
            <a href="#testimonials" className="text-sm text-muted-foreground transition hover:text-gray-900">Reviews</a>
            <Link href="/pricing" className="text-sm text-muted-foreground transition hover:text-gray-900">Pricing</Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-outline">Sign In</Link>
              <Link href="/login?register=1" className="btn-primary">Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-32 pt-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="badge mb-6 border border-brand-600/20 bg-brand-600/10 text-brand-600">
            AI-Powered Resume Building
          </span>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            Create Your Resume
            <br />
            <span className="text-brand-600">in Minutes</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Build professional, ATS-friendly resumes with AI-powered suggestions.
            Get noticed by employers and land your dream job faster.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login?register=1" className="btn-primary px-8 py-3 text-base shadow-lg">
              Start Building
            </Link>
            <Link href="/login" className="btn-outline border-accent-teal px-8 py-3 text-base text-accent-teal hover:bg-accent-teal hover:text-white">
              Sign In
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <span className="text-sm">50,000+ users</span>
            <span className="text-sm">4.9/5 rating</span>
            <span className="text-sm">ATS-Approved</span>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Why Choose Our Resume Builder?</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Powerful features designed to help you create professional resumes that get results.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card transition hover:border-brand-600/20 hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
                  {feature.icon}
                </div>
                <h3 className="text-center text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 text-center leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Professional Templates</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Choose from our collection of ATS-friendly templates designed by professionals.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {TEMPLATES.map((template) => (
              <div key={template.name} className="card overflow-hidden p-0 transition hover:shadow-xl">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/login?register=1" className="btn-outline border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white">
              View All Templates
            </Link>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Loved by Job Seekers</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              See what our users say about their experience with our resume builder.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card transition hover:shadow-lg">
                <p className="leading-relaxed text-gray-700">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="font-medium text-gray-900">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role} at {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-600 to-accent-teal py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Ready to Build Your Perfect Resume?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Join thousands of job seekers who have successfully landed their dream jobs using our platform.
          </p>
          <Link href="/login?register=1" className="inline-flex rounded-lg bg-white px-8 py-3 font-semibold text-brand-600 shadow-lg transition hover:bg-gray-100">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <IconResume className="h-6 w-6 text-brand-500" />
              <span className="text-lg font-semibold text-white">ResumeBuilder</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 ResumeBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
