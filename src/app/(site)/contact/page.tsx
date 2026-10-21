import Link from "next/link";
import PageLayout from "@/components/blocks/PageLayout";
import type { Metadata } from "next";
import { getPage, getCompany, getFaqsFor } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqList from "@/components/ui/FaqList";
import ContactLink from "@/components/site/ContactLink";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { STOCK, photoRef } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact the Workshop",
  description:
    "Call, WhatsApp or email Al Saqr Al Ahmar, or visit our workshop in Musaffah Industrial 44, Abu Dhabi.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [company, faqs] = await Promise.all([getCompany(), getFaqsFor("quote")]);
  const pg = await getPage("contact");
  const sections: Record<string, React.ReactNode> = {
    hero: (
      <>
        <PageHero
          image={pg.image("hero") ? photoRef(pg.image("hero")!) : STOCK.cranesDusk}
          crumbs={[{ name: "Contact", href: "/contact" }]}
          label={pg.text("hero", "label")}
          title={pg.text("hero", "title")}
          lede={pg.text("hero", "lede")}
        />
      </>
    ),
    main: (
      <>
        <section aria-label="Contact options" className="py-16 lg:py-24">
          <div data-stagger className="wrap grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col border-2 border-ink bg-card p-7">
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">Call</h2>
              <ul className="mt-4 space-y-2">
                {company.phones.map((p) => (
                  <li key={p.e164}>
                    <ContactLink channel="phone" href={`tel:${p.e164}`} className="inline-flex min-h-11 items-center font-mono text-2xl hover:text-accent">
                      {p.display}
                    </ContactLink>
                  </li>
                ))}
              </ul>
              {company.hours ? <p className="mt-auto pt-6 text-sm text-steel-text">{company.hours}</p> : null}
            </div>

            <div id="whatsapp" className="flex flex-col border-2 border-ink bg-card p-7">
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">WhatsApp</h2>
              <p className="mt-4 text-steel-text">
                Message the workshop. You&apos;ll see and can edit the message before WhatsApp opens.
              </p>
              {company.whatsapp ? (
                <div className="mt-auto pt-6">
                  <WhatsAppButton number={company.whatsapp} label="Message on WhatsApp" />
                </div>
              ) : (
                <p className="mt-auto pt-6 text-sm">WhatsApp is not available at the moment. Please call instead.</p>
              )}
            </div>

            <div className="flex flex-col border-2 border-ink bg-card p-7">
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">Written enquiry</h2>
              <p className="mt-4 text-steel-text">
                Send your scope, location and drawings. You get a reference number immediately.
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <Link href="/quote" className="btn btn-primary">
                  Request a Quote
                </Link>
                {company.email ? (
                  <ContactLink channel="email" href={`mailto:${company.email}`} className="btn btn-secondary">
                    Email
                  </ContactLink>
                ) : null}
              </div>
              {company.email ? <p className="mt-3 break-all text-sm text-steel-text">{company.email}</p> : null}
            </div>
          </div>
        </section>

        {pg.visible("visit") ? <section aria-labelledby="visit-title" className="on-ink py-16 lg:py-20">
          <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionHeading id="visit-title" label={pg.text("visit", "label")} title={pg.text("visit", "title")} intro={company.address} />
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
              {company.mapsUrl ? (
                <ContactLink channel="maps" href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Open in Google Maps
                </ContactLink>
              ) : null}
              {company.phones[0] ? (
                <ContactLink channel="phone" href={`tel:${company.phones[0].e164}`} className="btn btn-secondary-ink">
                  Call before visiting
                </ContactLink>
              ) : null}
            </div>
          </div>
        </section> : null}

        {faqs.length && pg.visible("faq") ? (
          <section aria-labelledby="faq-title" className="py-16 lg:py-24">
            <div className="wrap grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading id="faq-title" label="Questions" title={pg.text("faq", "title")} />
              </div>
              <div className="lg:col-span-8">
                <FaqList faqs={faqs} />
              </div>
            </div>
          </section>
        ) : null}
      </>
    ),
  };

  return <PageLayout page="contact" sections={sections} />;
}
