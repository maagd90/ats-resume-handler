export const FREE_FEATURES = [
  "3 optimizations / month",
  "ATS scoring + impact checklist",
  "In-browser resume editor",
  "LinkedIn guidance",
  "Word + ASCII-safe export",
  "Platform AI included",
];

export const PRIME_FEATURES = [
  "Unlimited optimizations",
  "JD-specific resume tailoring",
  "Cover letter generation",
  "24/7 job search automation",
  "Review Mode (approve before send)",
  "Activity transparency log",
  "Platform AI included",
];

export const COMPARISON_ROWS: { feature: string; free: boolean | string; prime: boolean | string }[] = [
  { feature: "Monthly optimizations", free: "3", prime: "Unlimited" },
  { feature: "ATS score + guidance", free: true, prime: true },
  { feature: "In-browser editor", free: true, prime: true },
  { feature: "LinkedIn optimizer", free: true, prime: true },
  { feature: "Word export", free: true, prime: true },
  { feature: "JD tailoring", free: false, prime: true },
  { feature: "Cover letters", free: false, prime: true },
  { feature: "Job automation", free: false, prime: true },
  { feature: "Review Mode", free: false, prime: true },
  { feature: "Platform AI", free: true, prime: true },
];

export const FEATURE_DEEP_DIVE = [
  {
    title: "ATS scoring",
    description: "Parseability, structure, keywords, and impact — with guidance on a healthy 75–80% target.",
  },
  {
    title: "In-browser editor",
    description: "Edit contact info, experience, skills, and summary with a live preview before export.",
  },
  {
    title: "JD tailoring",
    description: "Prime: align bullets and keywords to a specific job description without inventing facts.",
  },
  {
    title: "LinkedIn guidance",
    description: "Headline, About, and experience suggestions grounded in your verified resume data.",
  },
  {
    title: "ATS-safe export",
    description: "Single-column Word layouts with original PassATS presets — no decorative clutter.",
  },
  {
    title: "Responsible automation",
    description: "Prime job automation with Review Mode, daily caps, and a full activity log.",
  },
];
