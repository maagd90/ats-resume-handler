import Link from "next/link";
import LegalNote from "@/components/LegalNote";

export default function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <LegalNote variant="lawyerReview" className="mt-4" />
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-10 text-sm">
        Questions?{" "}
        <Link href="/contact" className="text-brand-600 hover:underline">
          Contact us
        </Link>
      </p>
    </article>
  );
}
