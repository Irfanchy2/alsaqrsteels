import Link from "next/link";
import type { Metadata } from "next";
import { getCompany, getServices, getFaqsFor } from "@/lib/content";
import { capabilityCategories, capabilities } from "@/lib/content/capabilities";
import PageHero from "@/components/ui/PageHero";
import ServiceVisual from "@/components/ui/ServiceVisual";
import FaqList from "@/components/ui/FaqList";
import SectionHeading from "@/components/ui/SectionHeading";
import CapabilitiesGrid from "@/components/services/CapabilitiesGrid";
import EnquiryCta from "@/components/site/EnquiryCta";
import { STOCK } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Steel Fabrication Services",
  description:
    "Structural steel, architectural metalwork, laser & CNC cutting, stainless steel, industrial piping, roofing, tanks and safety systems — fabricated and installed from Musaffah Industrial 44, Abu Dhabi.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [company, services, faqs] = await Promise.all([getCompany(), getServices(), getFaqsFor("general")]);

  return (
    <>
      <PageHero
        image={STOCK.weldingSparks}
        crumbs={[{ name: "Services", href: "/services" }]}
        label="Services"
        title="Engineered in steel. Built to last."
        lede="From detailing and CNC profiling through welding, fabrication and site installation — handled in-house at our Musaffah workshop for contractors, engineers and industrial clients across the UAE."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#capabilities" className="btn btn-primary">
            Explore our capabilities <span aria-hidden="true">↓</span>
          </Link>
          <Link href="/quote" className="btn btn-secondary">
            Request a Quotation
          </Link>
        </div>
      </PageHero>
      {/* Core disciplines — detailed, alternating sections ------------------ */}
      <section aria-label="Core disciplines" className="py-16 lg:py-24">
        <div className="wrap space-y-16 lg:space-y-24">
          {services.map((s, i) => (
            <article
              key={s.slug}
              aria-labelledby={`svc-${s.slug}`}
              className="grid gap-8 border-t-2 border-ink pt-8 lg:grid-cols-12 lg:gap-12 lg:pt-10"
              data-reveal={i % 2 ? "right" : "left"}
            >
              <div className={`lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`}>
                <p className="font-mono text-sm text-accent">{s.number}</p>
                <h2 id={`svc-${s.slug}`} className="mt-3 text-3xl font-bold sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-[58ch] text-lg text-steel-text">{s.intro}</p>
                <h3 className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">Scope</h3>
                <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  {s.scope.map((item) => (
                    <li key={item} className="flex items-start gap-3 border-b border-line py-2.5">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Link href={`/services/${s.slug}`} className="btn btn-secondary">
                    {s.title} details
                  </Link>
                  <Link href={`/quote?service=${s.slug}`} className="btn btn-primary">
                    Request a Quote
                  </Link>
                  <Link href={`/projects?service=${s.slug}`} className="link-arrow">
                    Related projects <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <ServiceVisual
                service={s}
                className={`aspect-[4/3] w-full border border-ink lg:col-span-5 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </article>
          ))}
        </div>
      </section>

      {/* Capabilities grid — everything we fabricate to order --------------- */}
      <section id="capabilities" aria-labelledby="capabilities-title" className="on-ink relative scroll-mt-24 py-20 lg:py-28">
        <div className="yard-grid absolute inset-0" aria-hidden="true" />
        <div className="wrap relative">
          <div className="max-w-3xl" data-reveal>
            <p className="label">Made to order</p>
            <h2 id="capabilities-title" className="mt-4 text-[2rem] sm:text-5xl">
              Explore our capabilities
            </h2>
            <p className="mt-5 text-lg text-on-ink-muted">
              {capabilities.length} types of steel and metal work we fabricate to your drawings, across {capabilityCategories.length}{" "}
              disciplines. Search or filter to find what you need, then send it straight to a quote.
            </p>
          </div>
          <div className="mt-10" data-reveal>
            <CapabilitiesGrid categories={capabilityCategories} />
          </div>
        </div>
      </section>

      {faqs.length ? (
        <section aria-labelledby="faq-title" className="border-t border-line bg-card py-20">
          <div className="wrap grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading id="faq-title" label="Questions" title="Common questions" />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      ) : null}

      <EnquiryCta company={company} />
    </>
  );
}
