import Link from "next/link";
import Image from "next/image";
import { STOCK } from "@/lib/content/stock";
import type { Company } from "@/lib/content/types";
import ContactLink from "./ContactLink";
import WhatsAppButton from "./WhatsAppButton";

export default function EnquiryCta({
  company,
  title = "Tell us about your project",
  text = "Send your scope, location and any drawings. Our team reviews every request and contacts you to discuss the next step.",
  quoteHref = "/quote",
  quoteLabel = "Request a Quote",
  whatsappMessage,
}: {
  company: Company;
  title?: string;
  text?: string;
  quoteHref?: string;
  quoteLabel?: string;
  whatsappMessage?: string;
}) {
  const phone = company.phones[0];
  return (
    <section aria-labelledby="cta-title" className="on-ink relative overflow-hidden border-t border-line">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={STOCK.weldingSparks.src} alt="" fill sizes="(max-width: 768px) 70vw, 100vw" quality={50} className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50" />
        <div className="forge-glow absolute inset-0" />
      </div>
      <div className="wrap relative grid gap-10 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7" data-reveal>
          <p className="label">Start an enquiry</p>
          <h2 id="cta-title" className="mt-4 text-4xl sm:text-6xl">
            {title}
          </h2>
          <p className="mt-5 max-w-[56ch] text-lg text-on-ink-muted">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={quoteHref} className="btn btn-primary">
              {quoteLabel}
            </Link>
            {company.whatsapp ? (
              <WhatsAppButton number={company.whatsapp} message={whatsappMessage} className="btn btn-secondary-ink" />
            ) : null}
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
          <dl className="divide-y divide-line-ink border-y border-line-ink">
            {phone ? (
              <div className="py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-on-ink-muted">Call the workshop</dt>
                <dd className="mt-1">
                  <ContactLink channel="phone" href={`tel:${phone.e164}`} className="font-mono text-2xl transition-colors hover:text-flame">
                    {phone.display}
                  </ContactLink>
                </dd>
              </div>
            ) : null}
            {company.email ? (
              <div className="py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-on-ink-muted">Email</dt>
                <dd className="mt-1">
                  <ContactLink channel="email" href={`mailto:${company.email}`} className="text-lg transition-colors hover:text-flame break-all">
                    {company.email}
                  </ContactLink>
                </dd>
              </div>
            ) : null}
            <div className="py-4">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-on-ink-muted">Workshop</dt>
              <dd className="mt-1 text-on-ink-muted">{company.address}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
