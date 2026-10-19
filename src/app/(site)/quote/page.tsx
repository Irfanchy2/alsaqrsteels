import type { Metadata } from "next";
import { getCompany, getServices, getFaqsFor } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import FaqList from "@/components/ui/FaqList";
import QuoteForm from "@/components/quote/QuoteForm";
import ContactLink from "@/components/site/ContactLink";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { STOCK } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Send your steel fabrication scope, location and drawings to Al Saqr Al Ahmar. PDF, JPG and PNG attachments accepted.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage() {
  const [company, services, faqs] = await Promise.all([getCompany(), getServices(), getFaqsFor("quote")]);
  const phone = company.phones[0] ?? null;
  return (
    <>
      <PageHero
        image={STOCK.cncSparks}
        crumbs={[{ name: "Request a Quote", href: "/quote" }]}
        label="Request a quote"
        title="Tell us what you need fabricated"
        lede="A few details and any drawings you have. Our team reviews every request and contacts you — pricing, programme and terms are always confirmed by our staff."
      />

      <section className="py-12 lg:py-16">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <QuoteForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} phone={phone} whatsapp={company.whatsapp} />
          </div>
          <aside className="space-y-8 lg:col-span-4 lg:col-start-9" aria-label="Other ways to reach us">
            <div className="on-ink border-t-4 border-flame p-6">
              <h2 className="text-2xl">Prefer to talk?</h2>
              <p className="mt-2 text-steel-text">Call the workshop or send a WhatsApp message.</p>
              <div className="mt-5 space-y-3">
                {phone ? (
                  <ContactLink channel="phone" href={`tel:${phone.e164}`} className="btn btn-primary w-full">
                    Call {phone.display}
                  </ContactLink>
                ) : null}
                {company.whatsapp ? (
                  <WhatsAppButton number={company.whatsapp} className="btn btn-whatsapp w-full" label="WhatsApp the workshop" />
                ) : null}
              </div>
              {company.hours ? <p className="mt-4 text-sm text-steel-text">{company.hours}</p> : null}
            </div>
            <div>
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">Before you send</h2>
              <div className="mt-3">
                <FaqList faqs={faqs} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
