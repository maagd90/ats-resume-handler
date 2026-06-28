import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteMetadata = {
  title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
  description:
    "Upload, score, and export ATS-friendly resumes. Platform AI included — no API keys required. Free tier + Prime job automation.",
  keywords: [
    "ATS resume",
    "resume optimizer",
    "applicant tracking system",
    "PassATS",
    "resume builder",
    "job application",
  ],
  openGraph: {
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description: "Resumes that machines and humans can read. ATS scoring, in-browser editor, Word export.",
    url: SITE_URL,
    siteName: PRODUCT_NAME,
    type: "website" as const,
  },
};

export const SUPPORT_EMAIL = "support@passats.com";
export const PRIVACY_EMAIL = "privacy@passats.com";
