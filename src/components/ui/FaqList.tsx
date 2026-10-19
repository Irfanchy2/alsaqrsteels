import type { Faq } from "@/lib/content/types";
import { JsonLd } from "@/components/site/JsonLd";

// Native <details> accordion: keyboard and screen-reader friendly with no JS.
export default function FaqList({ faqs, withSchema = true }: { faqs: Faq[]; withSchema?: boolean }) {
  if (!faqs.length) return null;
  return (
    <>
      <div className="border-t border-line">
        {faqs.map((f) => (
          <details key={f.id} className="group border-b border-line">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-lg font-semibold [&::-webkit-details-marker]:hidden">
              <span>{f.question}</span>
              <span
                aria-hidden="true"
                className="relative h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-4 before:-translate-y-1/2 before:bg-accent after:absolute after:left-1/2 after:top-0 after:h-4 after:w-0.5 after:-translate-x-1/2 after:bg-accent after:transition-transform group-open:after:scale-y-0"
              />
            </summary>
            <p className="max-w-[68ch] pb-6 text-steel-text">{f.answer}</p>
          </details>
        ))}
      </div>
      {withSchema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      ) : null}
    </>
  );
}
