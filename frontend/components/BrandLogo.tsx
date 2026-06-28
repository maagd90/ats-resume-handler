"use client";

import { PRODUCT_NAME } from "@/lib/brand";
import { IconResume } from "@/components/icons";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <IconResume className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">{PRODUCT_NAME}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">ATS studio</span>
      </span>
    </span>
  );
}
