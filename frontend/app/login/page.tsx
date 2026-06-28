"use client";

import { createCheckout, fetchMembership, login, register } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
      const result =
        mode === "login"
          ? await login(email, password)
          : await register(email, password, name || undefined);
      setAccessToken(result.access_token);
      router.push("/optimize");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-slate-600">
          Platform AI is included in every plan — you never need your own API key.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm font-medium">Name</label>
            <input className="input mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="input mt-1 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input mt-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button type="button" className="text-brand-700 underline" onClick={() => setMode("register")}>
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" className="text-brand-700 underline" onClick={() => setMode("login")}>
              Sign in
            </button>
          </>
        )}
      </p>
      <p className="text-center text-sm">
        <Link href="/pricing" className="text-slate-500 hover:text-brand-700">
          View pricing plans
        </Link>
      </p>
    </div>
  );
}
