import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 text-center">
      <BrandLogo />
      <h1 className="mt-8 text-4xl font-bold text-foreground">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you requested does not exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back home
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact support
        </Link>
      </div>
    </div>
  );
}
