"use client";

import Sidebar from "@/components/Sidebar";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { fetchMe } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTHLESS = ["/login", "/pricing"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isPrime, setIsPrime] = useState(false);

  const isAuthless = AUTHLESS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isAuthless) return;
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    fetchMe()
      .then((me) => {
        setEmail(me.email);
        setIsPrime(me.is_prime);
      })
      .catch(() => router.replace("/login"));
  }, [pathname, isAuthless, router]);

  if (isAuthless) {
    return <>{children}</>;
  }

  function logout() {
    clearAccessToken();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isPrime={isPrime} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Workspace</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{pathname.split("/").filter(Boolean).pop() || "Dashboard"}</p>
          </div>
          <div className="flex items-center gap-3">
            {isPrime ? (
              <span className="badge-prime">Prime</span>
            ) : (
              <Link href="/pricing" className="badge bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700">
                Free plan
              </Link>
            )}
            {email && <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>}
            <button type="button" onClick={logout} className="btn-ghost text-xs">
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
