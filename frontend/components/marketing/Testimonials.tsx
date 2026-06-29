/** Illustrative examples — not verified customer testimonials. */
const SAMPLES = [
  {
    quote: "The score breakdown showed me exactly which sections were weak before I exported.",
    role: "Illustrative example — QA professional",
  },
  {
    quote: "Review Mode let me approve each application instead of blasting hundreds of roles.",
    role: "Illustrative example — software engineer",
  },
];

export default function Testimonials() {
  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground">
        Illustrative examples only — not verified customer reviews. Replace with real testimonials when available.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {SAMPLES.map((t) => (
          <blockquote key={t.role} className="card">
            <p className="text-sm leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-3 text-xs text-muted-foreground">{t.role}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
