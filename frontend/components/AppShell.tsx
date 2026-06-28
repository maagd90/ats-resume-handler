"use client";

import Sidebar from "@/components/Sidebar";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { devUpgradePrime, fetchMe } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTHLESS = ["/", "/login", "/templates"];
const FULL_BLEED = ["/optimize"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isPrime, setIsPrime] = useState(false);
  const [ready, setReady] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const showDevPrime = process.env.NODE_ENV === "development";

  const isAuthless = AUTHLESS.some((p) => pathname === p);
  const isFullBleed = FULL_BLEED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicPricing = pathname === "/pricing" && !getAccessToken();

  useEffect(() => {
    if (isAuthless || isPublicPricing) {
      setReady(true);
      return;
    }
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    fetchMe()
      .then((me) => {
        setEmail(me.email);
        setIsPrime(me.is_prime);
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [pathname, isAuthless, isPublicPricing, router]);

  if (isAuthless || isPublicPricing) return <>{children}</>;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isFullBleed) {
    return <>{children}</>;
  }

  function logout() {
    clearAccessToken();
    router.push("/");
  }

  async function unlockPrimePreview() {
    setUnlocking(true);
    try {
      await devUpgradePrime();
      const me = await fetchMe();
      setIsPrime(me.is_prime);
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar email={email} isPrime={isPrime} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface px-8">
          <div />
          <div className="flex items-center gap-3">
            {isPrime ? (
              <span className="badge bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Prime</span>
            ) : (
              <>
                {showDevPrime && (
                  <button
                    type="button"
                    onClick={unlockPrimePreview}
                    disabled={unlocking}
                    className="btn-secondary text-xs"
                  >
                    {unlocking ? "Enabling…" : "Enable Prime (dev)"}
                  </button>
                )}
                <Link href="/pricing" className="badge bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800">
                  Upgrade
                </Link>
              </>
            )}
            <button type="button" onClick={logout} className="btn-ghost text-xs">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
