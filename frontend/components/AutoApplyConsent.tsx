"use client";

import LegalNote from "@/components/LegalNote";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export default function AutoApplyConsent({ checked, onChange }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <LegalNote variant="autoApply" />
      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-foreground">
          I understand that PassATS may prepare and submit job applications on my behalf when I approve them or when I
          disable Review Mode. I confirm the information in my profile is accurate.
        </span>
      </label>
    </div>
  );
}
