import type { FaqItem } from "@/lib/marketing/faqData";

export default function FaqAccordion({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {items.map((item, index) => (
        <details key={item.question} className="group px-4 py-3" open={index === defaultOpen}>
          <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
