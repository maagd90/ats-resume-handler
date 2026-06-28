"use client";

import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAgent, IconDashboard, IconJobs, IconLinkedIn, IconOptimize, IconPricing, IconResume } from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/optimize", label: "Editor", icon: IconOptimize },
  { href: "/templates", label: "Layouts", icon: IconResume },
  { href: "/resume", label: "Upload", icon: IconResume },
  { href: "/linkedin", label: "LinkedIn", icon: IconLinkedIn },
  { href: "/jobs", label: "Job Search", icon: IconJobs, prime: true },
  { href: "/applications", label: "Applications", icon: IconJobs, prime: true },
  { href: "/settings/criteria", label: "Job Criteria", icon: IconAgent, prime: true },
  { href: "/settings/agent", label: "Automation", icon: IconAgent, prime: true },
  { href: "/pricing", label: "Pricing", icon: IconPricing },
];

export default function Sidebar({ email, isPrime }: { email?: string | null; isPrime?: boolean }) {
  const pathname = usePathname();
  const initials = email ? email.slice(0, 2).toUpperCase() : "U";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-5">
        <Link href="/dashboard">
          <BrandLogo />
        </Link>
      </div>

      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{email || "User"}</p>
            <p className="text-xs text-muted-foreground">{isPrime ? "Prime" : "Free"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const primeFeature = item.prime && !isPrime;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "nav-active" : "text-gray-600 hover:bg-surface-muted dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {primeFeature && <span className="badge-prime text-[10px]">Prime</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="rounded-lg bg-brand-600/10 p-3 text-xs leading-relaxed text-brand-800 dark:text-brand-300">
          Platform AI included — no API keys on any plan.
        </p>
      </div>
    </aside>
  );
}
