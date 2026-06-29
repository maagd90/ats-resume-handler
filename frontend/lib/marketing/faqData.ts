export type FaqItem = { question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is an ATS and why does my resume get filtered?",
    answer:
      "An Applicant Tracking System (ATS) parses resumes before a recruiter sees them. If your layout, headings, or keywords are hard to parse, you may be filtered out even when you are qualified.",
  },
  {
    question: "What ATS score should I aim for?",
    answer:
      "Aim for roughly 75–80% match for a target role. Scores near 100% often mean keyword stuffing, which can hurt readability for human reviewers.",
  },
  {
    question: "Is my resume data private? Can I delete it?",
    answer:
      "Your uploads are used only to deliver optimization and (for Prime) applications you initiate. Contact privacy@passats.com to request export or deletion.",
  },
  {
    question: "Is Prime a subscription? Does it auto-renew?",
    answer:
      "No. Prime is a one-time charge for the term you choose (3, 6, or 12 months). It does not auto-renew. When your term ends, your account reverts to Free unless you purchase again.",
  },
  {
    question: "What's the difference between Free and Prime?",
    answer:
      "Free includes 3 optimizations per month, ATS scoring, LinkedIn guidance, and Word export. Prime adds unlimited optimizations, JD tailoring, cover letters, and optional job automation.",
  },
  {
    question: "Does the job automation apply without my review?",
    answer:
      "Review Mode is on by default. The automation prepares applications and queues them for your approval before anything is sent. You can change this in Job Criteria settings.",
  },
  {
    question: "Can automation get my job-board account flagged?",
    answer:
      "Automated applying carries platform risk. PassATS mitigates this with daily caps, match strictness controls, Review Mode, and preferring company career pages where possible. You remain responsible for compliance with each board's terms.",
  },
  {
    question: "Which file formats do you support?",
    answer: "Upload PDF, DOCX, or TXT. Export optimized resumes as ATS-safe Word (DOCX).",
  },
  {
    question: "Do I need my own OpenAI key?",
    answer: "No. Platform AI is included for all tiers. You never supply an API key.",
  },
  {
    question: "How do I get a refund?",
    answer:
      "Contact support@passats.com within 7 days of purchase for a full refund if automated applications have not been sent on your behalf. See our Refund Policy for details.",
  },
];

export const PRICING_FAQ = FAQ_ITEMS.filter((item) =>
  ["Is Prime a subscription", "What's the difference", "How do I get a refund"].some((k) =>
    item.question.includes(k.split("?")[0].slice(0, 20))
  )
);
