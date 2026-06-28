import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/resume", label: "Resume Review" },
  { href: "/linkedin", label: "LinkedIn Optimizer" },
  { href: "/jobs", label: "Job Matches" },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-lg font-semibold text-brand-700">ATS-Friendly Agent</p>
          <p className="text-xs text-slate-500">Resume · LinkedIn · Job Matching</p>
        </div>
        <nav className="flex gap-2">
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
