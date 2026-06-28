"use client";

import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { fetchMe } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/optimize", label: "Optimize" },
  { href: "/resume", label: "Resume" },
  { href: "/linkedin", label: "LinkedIn" },
  { href: "/jobs", label: "Jobs", prime: true },
  { href: "/applications", label: "Applications", prime: true },
  { href: "/settings/criteria", label: "Criteria", prime: true },
  { href: "/settings/agent", label: "Agent", prime: true },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      setEmail(null);
      return;
    }
    fetchMe()
      .then((me) => setEmail(me.email))
      .catch(() => setEmail(null));
  }, [pathname]);

  function logout() {
    clearAccessToken();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-lg font-semibold text-brand-700">ATS-Friendly Agent</p>
          <p className="text-xs text-slate-500">AI included — no API keys required</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {email ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-slate-500 sm:inline">{email}</span>
              <button type="button" onClick={logout} className="btn-secondary text-xs">
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
