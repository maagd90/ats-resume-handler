import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/marketing/SiteFooter";
import ThemeToggle from "@/components/ThemeToggle";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
              Pricing
            </Link>
            <Link href="/faq" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
              FAQ
            </Link>
            <ThemeToggle />
            <Link href="/login" className="btn-outline text-sm">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
