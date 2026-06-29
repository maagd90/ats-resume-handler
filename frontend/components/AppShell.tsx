"use client";

import Sidebar from "@/components/Sidebar";
import { AppShellSkeleton } from "@/components/LoadingSkeleton";
import { clearAccessToken, isLoggedIn } from "@/lib/auth";
import { showDevTools } from "@/lib/devTools";
import { devUpgradePrime, fetchMe } from "@/lib/api";
import { isAuthlessRoute } from "@/lib/publicRoutes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FULL_BLEED = ["/optimize"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isPrime, setIsPrime] = useState(false);
  const [ready, setReady] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const showDevPrime = showDevTools();

  const isAuthless = isAuthlessRoute(pathname);
  const isFullBleed = FULL_BLEED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicPricing = pathname === "/pricing" && !isLoggedIn();

  useEffect(() => {
    if (isAuthless || isPublicPricing) {
      setReady(true);
      return;
    }
    if (!isLoggedIn()) {
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

  if (!ready) return <AppShellSkeleton />;

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
                <Link href="/pricing" className="badge bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800">
                  Upgrade
                </Link>
              </>
            )}
            <button type="button" onClick={logout} className="btn-ghost text-xs" aria-label="Log out">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
