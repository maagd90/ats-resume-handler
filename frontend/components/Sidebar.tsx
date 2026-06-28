"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAgent, IconDashboard, IconJobs, IconLinkedIn, IconOptimize, IconPricing, IconResume } from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/optimize", label: "Resume Builder", icon: IconOptimize },
  { href: "/resume", label: "My Resume", icon: IconResume },
  { href: "/linkedin", label: "LinkedIn", icon: IconLinkedIn },
  { href: "/jobs", label: "Job Search", icon: IconJobs, prime: true },
  { href: "/applications", label: "Applications", icon: IconJobs, prime: true },
  { href: "/settings/criteria", label: "Job Criteria", icon: IconAgent, prime: true },
  { href: "/settings/agent", label: "Agent", icon: IconAgent, prime: true },
  { href: "/pricing", label: "Pricing", icon: IconPricing },
];

export default function Sidebar({ email, isPrime }: { email?: string | null; isPrime?: boolean }) {
  const pathname = usePathname();
  const initials = email ? email.slice(0, 2).toUpperCase() : "U";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <IconResume className="h-8 w-8 text-brand-600" />
          <span className="text-xl font-semibold text-gray-900">ResumeBuilder</span>
        </Link>
      </div>

      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{email || "User"}</p>
            <p className="text-xs text-muted-foreground">{isPrime ? "Prime member" : "Free plan"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const locked = item.prime && !isPrime;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={locked ? "/pricing" : item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "nav-active" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {locked && <span className="badge-prime text-[10px]">Prime</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link href="/pricing" className="block rounded-lg bg-brand-600/10 p-4 text-sm">
          <p className="font-semibold text-brand-700">Platform AI included</p>
          <p className="mt-1 text-xs text-gray-600">No API keys needed on any plan</p>
        </Link>
      </div>
    </aside>
  );
}
