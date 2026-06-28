"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAgent,
  IconDashboard,
  IconJobs,
  IconLinkedIn,
  IconOptimize,
  IconPricing,
  IconResume,
} from "@/components/icons";

const NAV = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/optimize", label: "Optimize", icon: IconOptimize },
  { href: "/resume", label: "My Resume", icon: IconResume },
  { href: "/linkedin", label: "LinkedIn", icon: IconLinkedIn },
  { href: "/jobs", label: "Job Search", icon: IconJobs, prime: true },
  { href: "/applications", label: "Applications", icon: IconJobs, prime: true },
  { href: "/settings/criteria", label: "Job Criteria", icon: IconAgent, prime: true },
  { href: "/settings/agent", label: "Agent", icon: IconAgent, prime: true },
  { href: "/pricing", label: "Pricing", icon: IconPricing },
];

export default function Sidebar({ isPrime = false }: { isPrime?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-slate-300">
      <div className="border-b border-sidebar-border px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <IconResume className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">ResumeAI</p>
            <p className="text-xs text-slate-400">ATS & Job Agent</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const locked = item.prime && !isPrime;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={locked ? "/pricing" : item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-sidebar-active text-white shadow-sm"
                  : locked
                    ? "text-slate-500 hover:bg-sidebar-hover hover:text-slate-400"
                    : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              <span className="flex-1">{item.label}</span>
              {locked && <span className="badge-prime text-[10px]">Prime</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Platform AI</p>
          <p className="mt-1 text-sm font-medium">Included in every plan</p>
          <p className="mt-1 text-xs opacity-75">No API keys needed</p>
          {!isPrime && (
            <Link href="/pricing" className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30">
              Upgrade to Prime
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
