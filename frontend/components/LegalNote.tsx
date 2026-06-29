"use client";

type Variant = "template" | "lawyerReview" | "autoApply";

const COPY: Record<Variant, string> = {
  template:
    "Layout presets and UI on this site are original PassATS designs for ATS-friendly exports. We are not affiliated with, endorsed by, or copying any third-party resume marketplace or community template file.",
  lawyerReview:
    "This page is a starter legal template — not legal advice. Have a qualified lawyer review before publishing, especially with live payments and job automation.",
  autoApply:
    "Job automation may submit your resume and contact details to employers on your behalf. You authorize each submission and remain responsible for accuracy and compliance with job-board terms. Account restrictions on third-party platforms are possible — use Review Mode and daily caps to reduce risk.",
};

export default function LegalNote({
  className = "",
  variant = "template",
}: {
  className?: string;
  variant?: Variant;
}) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      {COPY[variant]}
      {variant === "template" && (
        <> Company names on marketing pages are illustrative only unless you enter your own data.</>
      )}
    </p>
  );
}
