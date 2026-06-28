import Link from "next/link";

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
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-lg font-semibold text-brand-700">ATS-Friendly Agent</p>
          <p className="text-xs text-slate-500">Autonomous 24/7 Job Hunting</p>
        </div>
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
      </div>
    </header>
  );
}
