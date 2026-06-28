"use client";

import { login, register } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IconResume } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("register") === "1") {
      setMode("register");
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = mode === "login" ? await login(email, password) : await register(email, password, name || undefined);
      setAccessToken(result.access_token);
      router.push("/optimize");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel — Figma resume-builder style */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-sidebar via-brand-900 to-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <IconResume className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">ResumeAI</p>
            <p className="text-sm text-white/70">ATS Resume Builder</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Build resumes that pass ATS.<br />Land interviews faster.</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            AI-powered optimization, LinkedIn guidance, and a 24/7 job-hunting agent — all with platform AI included.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            <li className="flex items-center gap-2"><span className="text-brand-200">✓</span> ATS score with actionable fixes</li>
            <li className="flex items-center gap-2"><span className="text-brand-200">✓</span> Live resume preview</li>
            <li className="flex items-center gap-2"><span className="text-brand-200">✓</span> LinkedIn step-by-step guidance</li>
            <li className="flex items-center gap-2"><span className="text-brand-200">✓</span> No API keys — AI included</li>
          </ul>
        </div>
        <p className="text-xs text-white/50">Trusted by job seekers worldwide</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-2xl font-bold text-brand-700">ResumeAI</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-2 text-sm text-slate-500">Start optimizing your resume in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-slate-700">Full name</label>
                <input className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Muhammad Annus" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" required className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" required minLength={8} className="input mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create free account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "login" ? (
              <>No account? <button type="button" className="font-semibold text-brand-600" onClick={() => setMode("register")}>Register free</button></>
            ) : (
              <>Have an account? <button type="button" className="font-semibold text-brand-600" onClick={() => setMode("login")}>Sign in</button></>
            )}
          </p>
          <p className="mt-4 text-center text-sm">
            <Link href="/pricing" className="text-slate-400 hover:text-brand-600">View 3 / 6 / 12 month plans →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
