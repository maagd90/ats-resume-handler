"use client";

import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 text-center">
      <BrandLogo />
      <h1 className="mt-8 text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
        <Link href="/contact" className="btn-ghost">
          Contact support
        </Link>
      </div>
    </div>
  );
}
