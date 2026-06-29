import Link from "next/link";

const GUIDES = [
  { id: "upload", title: "Upload your resume", body: "Sign in, go to Resume or Optimize, and upload PDF/DOCX/TXT. We parse structure and run ATS checks." },
  { id: "ats-score", title: "Read your ATS score", body: "Aim for 75–80% for your target role. Scores near 100% may indicate keyword stuffing. Fix high-impact issues first." },
  { id: "recruiter-appeal", title: "Recruiter appeal score", body: "Separate from ATS parsing — measures summary strength, quantified outcomes, top-third impact, and conciseness. Hiring managers skim the top third in ~7 seconds." },
  { id: "layout", title: "Pick a layout", body: "Visit Templates to preview original PassATS presets. Apply one before export for consistent Word output." },
  { id: "tailor", title: "Tailor to a job (Prime)", body: "Paste a job description on Jobs to see matched and missing skills. Prime tailors bullets to the JD using verified facts only." },
  { id: "linkedin", title: "LinkedIn guidance", body: "Upload a LinkedIn PDF export or paste text. Review headline, About, and experience suggestions before copying to LinkedIn." },
  { id: "agent", title: "Set up automation safely", body: "Enable Review Mode, set match strictness and daily caps in Job Criteria, read the safety disclosure, then start automation from Agent Settings." },
];

export const metadata = { title: "Help — PassATS" };

export default function HelpPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-foreground">Help & guides</h1>
      <p className="mt-2 text-muted-foreground">Step-by-step guides for every major PassATS feature.</p>
      <div className="mt-8 space-y-8">
        {GUIDES.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-foreground">{g.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        Still stuck? <Link href="/contact" className="text-brand-600 hover:underline">Contact support</Link> or read the{" "}
        <Link href="/faq" className="text-brand-600 hover:underline">FAQ</Link>.
      </p>
    </article>
  );
}
