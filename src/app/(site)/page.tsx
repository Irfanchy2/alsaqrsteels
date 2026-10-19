import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getCompany,
  getServices,
  getProjects,
  getHighlights,
  getProcessSteps,
  getCertifications,
  getFaqsFor,
  getClientLogos,
} from "@/lib/content";
import type { ImageRef } from "@/lib/content/types";
import { WORK_PHOTOS } from "@/lib/content/seed";
import { STOCK, serviceStock } from "@/lib/content/stock";
import FaqList from "@/components/ui/FaqList";
import { StatusBadge } from "@/components/ui/ProjectCard";
import ContactLink from "@/components/site/ContactLink";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import QuickStart from "@/components/quote/QuickStart";
import ClientStrip from "@/components/site/ClientStrip";
import ServiceReel from "@/components/services/ServiceReel";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Precision Steelwork in Musaffah, Abu Dhabi | Al Saqr Al Ahmar" },
  description:
    "Structural steel, pipeline welding, laser and CNC cutting, storage containers and stainless steel fabrication from our workshop in Musaffah Industrial 44, Abu Dhabi.",
  alternates: { canonical: "/" },
};

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export default async function HomePage() {
  const [company, services, projects, highlights, steps, certs, faqs, clients] = await Promise.all([
    getCompany(),
    getServices(),
    getProjects(),
    getHighlights(),
    getProcessSteps(),
    getCertifications(),
    getFaqsFor("general"),
    getClientLogos(),
  ]);

  // Every photograph appears once on this page. The two genuine yard photos
  // belong to the About section; a service only shows its CMS photo when that
  // photo is not already used above, otherwise its discipline photo.
  const hero = STOCK.steelErection;
  const used = new Set<string>([hero.src, WORK_PHOTOS.steelFrame.src, WORK_PHOTOS.tankFrame.src]);
  const reel = services.map((s) => {
    const photo: ImageRef = s.image && !used.has(s.image.src) ? s.image : serviceStock(s);
    used.add(photo.src);
    return { slug: s.slug, title: s.title, summary: s.summary, photo };
  });

  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const register = ordered.slice(0, 6);
  const [aboutLead, ...aboutRest] = company.aboutBody.split(/\n\s*\n/);
  const facts = highlights.filter((h) => h.value);

  return (
    <>
      {/* Hero: plain statement beside one large photograph. The only
          animated moment on the page is this load-in. */}
      <section aria-labelledby="hero-title" className="border-b border-line bg-ink">
        <div className="wrap grid gap-10 pb-12 pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-16 lg:pt-14">
          <div className="flex flex-col lg:col-span-6 lg:py-6">
            <p className="label fade-up" style={d(40)}>
              Steel fabrication and erection, Abu Dhabi
            </p>
            <h1 id="hero-title" className="mt-4 text-[2.9rem] sm:text-[4rem] lg:text-[4.75rem]">
              <span className="line-mask">
                <span style={d(120)}>{company.heroTitle}</span>
              </span>
            </h1>
            <p className="fade-up mt-7 max-w-[54ch] text-lg text-steel-text" style={d(320)}>
              {company.heroSubtitle}
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={d(440)}>
              <Link href="/quote" className="btn btn-primary">
                Request a quote
              </Link>
              <Link href="/projects" className="btn btn-secondary">
                See our projects
              </Link>
            </div>

            {facts.length ? (
              <dl className="fade-up mt-auto grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-8 lg:mt-14" style={d(560)}>
                {facts.map((h) => (
                  <div key={h.label}>
                    <dt className="text-sm text-steel">{h.label}</dt>
                    <dd className="mt-1 text-[1.05rem] font-semibold text-on-ink">{h.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <figure className="fade-up relative lg:col-span-6" style={d(200)}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink-2 lg:aspect-auto lg:h-full lg:min-h-[34rem]">
              <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover saturate-[0.55] brightness-[0.9]" />
            </div>
          </figure>
        </div>
      </section>

      <ClientStrip logos={clients} />

      {/* Services carousel: the one bold element on the page. */}
      <section aria-labelledby="services-title" className="overflow-hidden py-20 lg:py-28">
        <div className="wrap grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="services-title" className="text-4xl sm:text-5xl lg:text-[3.5rem]">
              What leaves our workshop
            </h2>
            <p className="mt-5 max-w-[56ch] text-lg text-steel-text">
              {services.length} disciplines under one roof. Drawings and detailing are done before steel is cut, and the same
              team fabricates and installs.
            </p>
          </div>
          <p className="lg:col-span-5 lg:text-end">
            <Link href="/services" className="link-arrow">
              All services in detail
            </Link>
          </p>
        </div>
        <div className="mt-10">
          <ServiceReel items={reel} />
        </div>
      </section>

      {/* About, with the two genuine workshop photographs. */}
      <section aria-labelledby="about-title" className="border-t border-line bg-paper-2 py-20 lg:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className="label">About the workshop</p>
            <h2 id="about-title" className="mt-3 text-4xl sm:text-5xl">
              {company.aboutTitle}
            </h2>
            <p className="mt-7 text-lg text-on-ink">{aboutLead}</p>
            {aboutRest.map((p) => (
              <p key={p.slice(0, 20)} className="mt-4 text-steel-text">
                {p}
              </p>
            ))}
            <ul className="mt-9 divide-y divide-line border-y border-line">
              {[
                ["In-house detailing", "Drawings are prepared and approved before steel is cut."],
                ["CNC profiling", "Plate and sections are cut from the same detailed information."],
                ["One team", "Cutting, fabrication and installation stay with us."],
              ].map(([title, body]) => (
                <li key={title} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <span className="font-semibold">{title}</span>
                  <span className="text-steel-text">{body}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link href="/about" className="btn btn-secondary">
                About the company
              </Link>
              {company.mapsUrl ? (
                <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
                  Find the workshop on Google Maps
                </a>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:col-start-7">
            <figure className="photo-zoom relative row-span-2 aspect-[3/4] overflow-hidden rounded-sm">
              <Image src={WORK_PHOTOS.steelFrame.src} alt={WORK_PHOTOS.steelFrame.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </figure>
            <figure className="photo-zoom relative aspect-[3/4] overflow-hidden rounded-sm">
              <Image src={WORK_PHOTOS.tankFrame.src} alt={WORK_PHOTOS.tankFrame.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </figure>
            <figcaption className="self-end text-sm text-steel-text">
              Fabricated frames in our yard at Musaffah Industrial 44.
            </figcaption>
          </div>
        </div>
      </section>

      {/* Project register: the record reads like a drawing register. */}
      {register.length ? (
        <section aria-labelledby="projects-title" className="py-20 lg:py-28">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 id="projects-title" className="text-4xl sm:text-5xl">
                  Project record
                </h2>
                <p className="mt-4 max-w-[56ch] text-lg text-steel-text">
                  Structural steel fabrication and erection on projects across the UAE.
                </p>
              </div>
              <Link href="/projects" className="link-arrow">
                All {projects.length} projects
              </Link>
            </div>
            <ul className="mt-10 border-t border-line-strong">
              {register.map((p) => (
                <li key={p.slug} className="group relative border-b border-line">
                  <div className="grid items-center gap-x-6 gap-y-1 py-5 sm:grid-cols-[6.5rem_1fr_auto] lg:grid-cols-[7rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_7rem]">
                    <span className="font-mono text-[0.85rem] text-steel">{p.code}</span>
                    <h3 className="text-xl leading-snug sm:text-[1.4rem]">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-flame group-hover:decoration-2 group-hover:underline-offset-4"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <span className="text-steel-text sm:col-start-2 lg:col-start-auto">{p.location}</span>
                    <span className="hidden text-steel-text lg:block">{p.sector}</span>
                    <span className="sm:row-start-1 sm:col-start-3 lg:col-start-auto lg:row-start-auto lg:text-end">
                      <StatusBadge status={p.status} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Process: a genuine sequence, so it is numbered. */}
      {steps.length ? (
        <section aria-labelledby="process-title" className="border-t border-line bg-paper-2 py-20 lg:py-28">
          <div className="wrap grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="process-title" className="text-4xl sm:text-5xl">
                How a job runs
              </h2>
              <p className="mt-5 max-w-[40ch] text-lg text-steel-text">
                Every quotation confirms the exact scope, programme and responsibilities in writing.
              </p>
            </div>
            <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-5 border-t border-line py-6">
                  <span className="font-display text-3xl font-bold leading-none text-steel [font-stretch:86%]">{i + 1}</span>
                  <div>
                    <h3 className="text-xl">{s.title}</h3>
                    <p className="mt-2 text-steel-text">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Certifications and questions. */}
      <section aria-labelledby="quality-title" className="border-t border-line py-20 lg:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="quality-title" className="text-4xl sm:text-5xl">
              Quality and documents
            </h2>
            <p className="mt-5 max-w-[48ch] text-lg text-steel-text">
              Fabrication follows drawings you have approved, and CNC cutting runs from the same detailed information.
            </p>
            {certs.length ? (
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {certs.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="font-semibold">{c.title}</span>
                    {c.validUntil ? (
                      <span className="text-sm text-steel-text">
                        Valid to {new Date(c.validUntil).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 max-w-[48ch] border-s-2 border-flame ps-5 text-steel-text">
                Current certificates are being re-issued and will be listed here once verified. Ask us for the documents your
                tender or pre-qualification needs.
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-6">
              <Link href="/quote?topic=certificates" className="btn btn-secondary">
                Request documents
              </Link>
              <Link href="/quality" className="link-arrow">
                Quality and certifications
              </Link>
            </div>
          </div>
          {faqs.length ? (
            <div className="lg:col-span-7">
              <h3 className="text-2xl">Before you send a request</h3>
              <div className="mt-4">
                <FaqList faqs={faqs} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Contact + quick quote. */}
      <section aria-labelledby="contact-title" className="border-t border-line bg-ink py-20 lg:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="contact-title" className="text-4xl sm:text-5xl">
              Talk to the workshop
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg text-steel-text">
              Quotations, site surveys and fabrication schedules. Call, message us on WhatsApp, or start a request here.
            </p>
            <dl className="mt-9 divide-y divide-line border-y border-line">
              {company.phones.length ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="text-steel">Phone</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-1">
                    {company.phones.map((p) => (
                      <ContactLink key={p.e164} channel="phone" href={`tel:${p.e164}`} className="font-mono hover:text-white">
                        {p.display}
                      </ContactLink>
                    ))}
                  </dd>
                </div>
              ) : null}
              {company.email ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="text-steel">Email</dt>
                  <dd>
                    <ContactLink channel="email" href={`mailto:${company.email}`} className="break-all hover:text-white">
                      {company.email}
                    </ContactLink>
                  </dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-4 sm:grid-cols-[6rem_1fr]">
                <dt className="text-steel">Address</dt>
                <dd className="text-steel-text">{company.address}</dd>
              </div>
              {company.hours ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="text-steel">Hours</dt>
                  <dd className="text-steel-text">{company.hours}</dd>
                </div>
              ) : null}
            </dl>
            {company.whatsapp ? (
              <div className="mt-8">
                <WhatsAppButton number={company.whatsapp} className="btn btn-whatsapp" />
              </div>
            ) : null}
          </div>

          <div className="rounded-sm border border-line bg-card p-6 sm:p-8 lg:col-span-6 lg:col-start-7">
            <h3 className="text-2xl">Start a request</h3>
            <p className="mt-2 text-steel-text">Two minutes now; drawings and contact details on the next step.</p>
            <div className="mt-6">
              <QuickStart services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
