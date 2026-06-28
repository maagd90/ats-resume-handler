import FaqAccordion from "@/components/marketing/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/marketing/faqData";

export const metadata = { title: "FAQ — PassATS" };

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Frequently asked questions</h1>
      <p className="mt-2 text-muted-foreground">Everything you need to know about PassATS, ATS scores, and Prime.</p>
      <div className="mt-8">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
