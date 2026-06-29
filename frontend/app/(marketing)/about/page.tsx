import Link from "next/link";

export const metadata = { title: "About — PassATS" };

export default function AboutPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-foreground">About PassATS</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          PassATS is an ATS resume studio built for job seekers who need resumes that both parsing software and human
          recruiters can read clearly.
        </p>
        <p>
          We combine rule-based ATS scoring with platform-hosted AI so you never need your own API keys. Free tier covers
          essentials; Prime adds tailoring, cover letters, and optional job automation with Review Mode.
        </p>
        <p>
          We believe responsible automation means transparency, daily caps, and human approval — not spamming hundreds of
          applications.
        </p>
        <Link href="/contact" className="text-brand-600 hover:underline">
          Get in touch →
        </Link>
      </div>
    </article>
  );
}
