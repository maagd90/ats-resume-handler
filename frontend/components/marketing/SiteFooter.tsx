import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { PRODUCT_NAME } from "@/lib/brand";
import { SUPPORT_EMAIL } from "@/lib/marketing/content";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              ATS resume studio. Platform AI included — no API keys required.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
              Layouts
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {PRODUCT_NAME}. Legal pages are starter templates — have a lawyer review before
          launch.
        </p>
      </div>
    </footer>
  );
}
