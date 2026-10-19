import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompany, getServices, getService, getProjects, getFaqsFor, projectsForService } from "@/lib/content";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceVisual from "@/components/ui/ServiceVisual";
import ProjectCard from "@/components/ui/ProjectCard";
import FaqList from "@/components/ui/FaqList";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryCta from "@/components/site/EnquiryCta";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";
import { serviceStock } from "@/lib/content/stock";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return {
    title: s.seoTitle ?? s.title,
    description: s.seoDescription ?? s.summary,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: s.image ? { images: [{ url: s.image.src, width: s.image.width, height: s.image.height, alt: s.image.alt }] } : undefined,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, services, company, projects, faqs] = await Promise.all([
    getService(slug),
    getServices(),
    getCompany(),
    getProjects(),
    getFaqsFor(slug),
  ]);
  if (!service) notFound();
  const related = projectsForService(projects, service.slug);
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <section className="on-ink grain relative -mt-[5.5rem] lg:-mt-[6.25rem] overflow-hidden pt-[5.5rem] lg:pt-[6.25rem]">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src={serviceStock(service).src} alt="" fill priority sizes="100vw" className="kenburns object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
          <div className="forge-glow absolute inset-0" />
        </div>
        <div className="wrap relative grid gap-10 pb-14 pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-14">
          <div className="lg:col-span-7">
            <Breadcrumbs onInk items={[{ name: "Services", href: "/services" }, { name: service.title, href: `/services/${service.slug}` }]} />
            <p className="label fade-up mt-10">Service {service.number}</p>
            <h1 className="mt-5 text-[2.8rem] sm:text-6xl lg:text-[4.6rem]">
              <span className="line-mask">
                <span style={{ ["--d" as string]: "120ms" }}>{service.title}</span>
              </span>
            </h1>
            <p className="fade-up mt-6 max-w-[58ch] text-lg text-on-ink-muted sm:text-xl" style={{ ["--d" as string]: "260ms" }}>
              {service.intro}
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "380ms" }}>
              <Link href={`/quote?service=${service.slug}`} className="btn btn-primary">
                Request a Quote for {service.title}
              </Link>
              <Link href="/projects" className="btn btn-secondary-ink">
                Explore Our Projects
              </Link>
            </div>
          </div>
          <ServiceVisual
            service={service}
            priority
            className="fade-up aspect-[4/3] w-full self-end border border-line-ink border-t-4 border-t-flame lg:col-span-5"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </div>
        <div className="spark-rule relative" aria-hidden="true" />
      </section>

      <section aria-label="Scope and applications" className="py-16 lg:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <h2 className="text-4xl">Scope of work</h2>
            <ul className="mt-6 border-t-2 border-flame">
              {service.scope.map((item, i) => (
                <li key={item} className="flex items-baseline gap-5 border-b border-line py-4 text-lg">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8" data-reveal>
            <h2 className="text-4xl">Applications</h2>
            <ul className="mt-6 border-t-2 border-flame">
              {service.applications.map((item) => (
                <li key={item} className="border-b border-line py-4 text-lg">
                  {item}
                </li>
              ))}
            </ul>
            <div className="on-ink mt-8 border-t-4 border-flame p-6">
              <h3 className="text-lg font-bold">What to send with your request</h3>
              <p className="mt-2 text-steel-text">
                Drawings, a BOQ or site photographs, the project location, quantities and your target date. PDF, JPG and
                PNG files up to 10 MB each.
              </p>
              <Link href={`/quote?service=${service.slug}`} className="link-arrow mt-4">
                Start a request <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="related-title" className="border-t border-line bg-paper-2 py-16 lg:py-24">
        <div className="wrap">
          <SectionHeading id="related-title" label="Related projects" title={`${service.title} on our projects`} />
          {related.length ? (
            <ul data-stagger className="mt-10 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((p, i) => (
                <li key={p.slug} data-reveal>
                  <ProjectCard project={p} index={i} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 max-w-[60ch] text-steel-text" data-reveal>
              Project examples for this service are being documented. Ask our team for references relevant to your
              scope when you request a quote.
            </p>
          )}
          {related.length > 4 ? (
            <Link href={`/projects?service=${service.slug}`} className="link-arrow mt-8">
              All {service.title.toLowerCase()} projects <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </section>

      {faqs.length ? (
        <section aria-labelledby="faq-title" className="py-16 lg:py-24">
          <div className="wrap grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading id="faq-title" label="Questions" title={`${service.title}: common questions`} />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      ) : null}

      <nav aria-labelledby="other-title" className="border-t border-line bg-card py-14">
        <div className="wrap">
          <h2 id="other-title" className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">
            Other services
          </h2>
          <ul data-stagger className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <li key={s.slug} className="bg-card">
                <Link href={`/services/${s.slug}`} className="flex min-h-16 items-center gap-3 p-5 font-semibold hover:text-accent">
                  <span className="font-mono text-xs text-accent">{s.number}</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <EnquiryCta
        company={company}
        title={`Discuss a ${service.title.toLowerCase()} requirement`}
        quoteHref={`/quote?service=${service.slug}`}
        whatsappMessage={`Hello Al Saqr Al Ahmar, I would like to discuss a ${service.title.toLowerCase()} requirement.`}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          serviceType: service.title,
          url: `${SITE_URL}/services/${service.slug}`,
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@type": "Country", name: "United Arab Emirates" },
        }}
      />
    </>
  );
}
