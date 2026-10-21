import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPage,
  getMotion,
  getCompany,
  getServices,
  getProjects,
  getHighlights,
  getProcessSteps,
  getCertifications,
  getFaqsFor,
  getClientLogos,
} from "@/lib/content";
import { WORK_PHOTOS } from "@/lib/content/seed";
import { STOCK, serviceStock } from "@/lib/content/stock";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/ui/ProjectCard";
import FaqList from "@/components/ui/FaqList";
import CountUp from "@/components/ui/CountUp";
import ContactLink from "@/components/site/ContactLink";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import QuickStart from "@/components/quote/QuickStart";
import ClientStrip from "@/components/site/ClientStrip";
import ScrollCue from "@/components/site/ScrollCue";
import PageLayout from "@/components/blocks/PageLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Precision Steelwork in Musaffah, Abu Dhabi | Al Saqr Al Ahmar" },
  description:
    "Structural steel, pipeline welding, laser and CNC cutting, storage containers and stainless steel fabrication from our workshop in Musaffah Industrial 44, Abu Dhabi.",
  alternates: { canonical: "/" },
};

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
const delay = (ms: number) => ({ ["--reveal-delay" as string]: `${ms}ms` });

// Deterministic spark field for the hero (no randomness, so server and client
// markup always match).
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  ["--t" as string]: `${5 + ((i * 13) % 6)}s`,
  ["--delay" as string]: `${(i * 0.45) % 7}s`,
  ["--dx" as string]: `${((i * 29) % 120) - 60}px`,
}));

export default async function HomePage() {
  const [pg, motion, company, services, projects, highlights, steps, certs, faqs, clients] = await Promise.all([
    getPage("home"),
    getMotion(),
    getCompany(),
    getServices(),
    getProjects(),
    getHighlights(),
    getProcessSteps(),
    getCertifications(),
    getFaqsFor("general"),
    getClientLogos(),
  ]);
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const shown = ordered.slice(0, ordered.length >= 6 ? 6 : 3);
  const [aboutLead, ...aboutRest] = company.aboutBody.split(/\n\s*\n/);
  const [heroA, ...heroB] = company.heroTitle.split(/(?<=\.)\s+/);
  const heroImage = pg.image("hero") ?? STOCK.heroWelding.src;
  const bandImage = pg.image("band") ?? STOCK.steelErection.src;
  const eyebrowAuto = [company.establishedYear ? `Est. ${company.establishedYear}` : null, "Musaffah Industrial 44, Abu Dhabi, UAE"]
    .filter(Boolean)
    .join(" · ");
  const eyebrow = pg.text("hero", "eyebrow") || eyebrowAuto;
  const ticker = services.flatMap((s) => [s.title, ...s.scope.slice(0, 3)]);
  // Two wide cards, then rows of three; the "not sure" card fills what is left.
  const leftover = (6 - ((Math.max(0, services.length - 2) * 2) % 6)) % 6;
  const ctaSpan =
    leftover === 4
      ? "lg:col-span-4"
      : leftover === 2
        ? "lg:col-span-2"
        : "lg:col-span-6 lg:min-h-0 lg:flex-row lg:items-center";
  const aboutPhotos = new Set<string>([WORK_PHOTOS.steelFrame.src, WORK_PHOTOS.tankFrame.src]);
  const years = company.establishedYear ? new Date().getFullYear() - company.establishedYear : null;

  const sections: Record<string, React.ReactNode> = {
    hero: (
      <>
        {/* Hero — full-screen weld photograph ---------------------------------- */}
        <section className="on-ink grain relative -mt-[5.5rem] lg:-mt-[6.25rem] flex min-h-[100svh] flex-col overflow-hidden pt-[5.5rem] lg:pt-[6.25rem]" aria-labelledby="hero-title">
          <div className="absolute inset-x-0 -top-[14%] -bottom-[14%]" data-parallax="0.3" aria-hidden="true">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="kenburns object-cover object-[60%_40%] opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/50" />
            <div className="forge-glow absolute inset-0" />
            {motion.heroSparks ? <div className="sparks">
              {SPARKS.map((s, i) => (
                <i key={i} style={s} />
              ))}
            </div> : null}
          </div>

          <div className="wrap relative flex flex-1 flex-col justify-center pb-10 pt-16 lg:pb-36 lg:pt-10" data-scroll-fade>
            <p className="label fade-up" style={d(80)}>
              {eyebrow}
            </p>
            <h1 id="hero-title" className="mt-6 max-w-5xl text-[3.1rem] sm:text-7xl lg:text-[6.4rem]">
              <span className="line-mask">
                <span style={d(160)}>{heroA}</span>
              </span>
              {heroB.length ? (
                <span className="line-mask">
                  <span style={d(300)} className="text-spark">
                    {heroB.join(" ")}
                  </span>
                </span>
              ) : null}
            </h1>
            <p className="fade-up mt-7 max-w-[58ch] text-base text-on-ink/80 sm:text-lg" style={d(460)}>
              {company.heroSubtitle}
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={d(580)}>
              <Link href="/quote" className="btn btn-primary">
                {pg.text("hero", "primaryCta")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects" className="btn btn-secondary-ink">
                {pg.text("hero", "secondaryCta")}
              </Link>
            </div>
            {motion.enabled && motion.scrollFx ? <ScrollCue target="after-hero" /> : null}
          </div>

          {highlights.length ? (
            <div className="relative border-t border-white/10 bg-ink/60 backdrop-blur-md">
              <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
                {highlights.map((h, i) => (
                  <div
                    key={h.label}
                    className={`fade-up py-5 lg:py-7 ${i % 2 ? "ps-5 lg:ps-8" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${i ? "lg:border-s lg:border-white/10 lg:ps-8" : ""}`}
                    style={d(700 + i * 90)}
                  >
                    <dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-on-ink-muted">{h.label}</dt>
                    <dd className="mt-2 font-display text-2xl font-extrabold uppercase leading-none text-amber [font-stretch:78%] sm:text-3xl">
                      <CountUp value={h.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
        <span id="after-hero" aria-hidden="true" className="block scroll-mt-24" />
      </>
    ),
    ticker: (
      <>
        {/* Ticker of real service lines ---------------------------------------- */}
        {pg.visible("ticker") ? <div className="relative overflow-hidden border-y border-line bg-flame py-4 text-ink">
          <div className="marquee" aria-label="Services and typical items">
            {[0, 1].map((copy) => (
              <ul key={copy} className="marquee__track" aria-hidden={copy === 1 ? true : undefined}>
                {ticker.map((t, i) => (
                  <li key={`${copy}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
                    <span className="font-display text-xl font-extrabold uppercase [font-stretch:78%]">{t}</span>
                    <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-ink" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div> : null}
      </>
    ),
    clients: (
      <>
        {/* Trusted by — client logos ------------------------------------------ */}
        {pg.visible("clients") ? <ClientStrip logos={clients} title={pg.text("clients", "title")} subtitle={pg.text("clients", "subtitle")} /> : null}
      </>
    ),
    about: (
      <>
        {/* About the yard — photo collage + copy ------------------------------- */}
        {pg.visible("about") ? <section aria-labelledby="about-title" className="relative py-24 lg:py-32">
          <div className="wrap grid gap-14 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-6" data-reveal="left">
              <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: "1 / 1.02" }}>
                <div className="photo-zoom relative col-span-3 row-span-6 overflow-hidden">
                  <Image src={WORK_PHOTOS.steelFrame.src} alt={WORK_PHOTOS.steelFrame.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
                </div>
                <div className="photo-zoom relative col-span-2 row-span-3 overflow-hidden">
                  <Image src={WORK_PHOTOS.tankFrame.src} alt={WORK_PHOTOS.tankFrame.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </div>
                <div className="photo-zoom relative col-span-2 row-span-3 overflow-hidden">
                  <Image src={STOCK.grindingWorker.src} alt={STOCK.grindingWorker.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </div>
              </div>
              {years ? (
                <div data-parallax="-0.12" className="absolute -bottom-6 -end-2 bg-flame px-6 py-5 text-ink shadow-2xl sm:-end-6 lg:px-8 lg:py-6">
                  <p className="font-display text-5xl font-extrabold leading-none [font-stretch:72%] lg:text-6xl">{years}+</p>
                  <p className="mt-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em]">Years in steel</p>
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-6" data-reveal="right">
              <p className="label">{pg.text("about", "label")}</p>
              <h2 id="about-title" className="mt-4 text-[2.3rem] sm:text-5xl lg:text-[3.4rem]">
                {company.aboutTitle}
              </h2>
              <p className="mt-7 text-lg text-on-ink">{aboutLead}</p>
              {aboutRest.map((p) => (
                <p key={p.slice(0, 20)} className="mt-4 text-steel-text">
                  {p}
                </p>
              ))}
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["In-house detailing", "Drawings approved before steel is cut"],
                  ["CNC profiling", "Cut from the same detailed information"],
                  ["One team", "Cutting, fabrication and installation"],
                  ["Musaffah workshop", "Close to Abu Dhabi's industrial sites"],
                ].map(([strong, rest]) => (
                  <li key={strong} className="flex gap-3 border border-line bg-card p-4">
                    <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center bg-flame text-[0.75rem] font-bold text-ink">
                      ✓
                    </span>
                    <span>
                      <strong className="block font-semibold text-on-ink">{strong}</strong>
                      <span className="text-sm text-steel-text">{rest}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link href="/about" className="btn btn-primary">
                  {pg.text("about", "cta")} <span aria-hidden="true">→</span>
                </Link>
                <Link href="/contact" className="link-arrow">
                  {pg.text("about", "link")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section> : null}
      </>
    ),
    services: (
      <>
        {/* Services — photo cards ---------------------------------------------- */}
        {pg.visible("services") ? <section aria-labelledby="services-title" className="relative border-t border-line bg-paper-2 py-24 lg:py-32">
          <div className="wrap relative">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                id="services-title"
                label={pg.text("services", "label")}
                title={pg.text("services", "title")}
                intro={pg.text("services", "intro")}
              />
              <Link href="/services" className="link-arrow" data-reveal>
                All services <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul data-stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {services.map((s, i) => {
                // The two yard photos already appear in the About collage, so a
                // service using one of them shows its discipline photo instead.
                const photo = s.image && !aboutPhotos.has(s.image.src) ? s.image : serviceStock(s, i);
                const wide = i < 2;
                return (
                  <li
                    key={s.slug}
                    className={`photo-zoom group relative flex min-h-[24rem] flex-col justify-end overflow-hidden border border-line-ink bg-ink ${wide ? "lg:col-span-3 lg:min-h-[28rem]" : "lg:col-span-2"}`}
                    data-reveal="photo"
                    data-tilt
                    style={delay(i * 70)}
                  >
                    <Image src={photo.src} alt="" fill sizes={wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} className="object-cover opacity-75" />
                    <div aria-hidden="true" className="photo-shade absolute inset-0" />
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-flame transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="relative p-7 lg:p-8">
                      <p className="font-mono text-xs tracking-[0.16em] text-amber">{s.number}</p>
                      <h3 className="mt-2 text-3xl text-on-ink [font-stretch:78%] lg:text-[2.1rem]">
                        <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0 group-hover:text-flame">
                          {s.title}
                        </Link>
                      </h3>
                      <p className="mt-3 max-w-[46ch] text-sm text-on-ink/75">{s.summary}</p>
                      <p className="mt-5 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-on-ink-muted transition-colors group-hover:text-amber">
                        Explore service <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </p>
                    </div>
                  </li>
                );
              })}
              <li
                className={`relative flex min-h-[18rem] flex-col justify-between overflow-hidden bg-flame p-7 text-ink lg:p-8 ${ctaSpan}`}
                data-reveal
                style={delay(services.length * 70)}
              >
                <div>
                  <p className="font-mono text-xs tracking-[0.16em]">00 — Not sure?</p>
                  <h3 className="mt-3 text-3xl [font-stretch:78%]">{pg.text("services", "ctaTitle")}</h3>
                  <p className="mt-4 max-w-[48ch] text-sm font-medium">
                    {pg.text("services", "ctaText")}
                  </p>
                </div>
                <Link href="/quote" className="btn mt-8 self-start bg-ink text-on-ink hover:bg-ink-3">
                  Start a request <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </section> : null}
      </>
    ),
    band: (
      <>
        {/* Full-bleed statement band ------------------------------------------- */}
        {pg.visible("band") ? <section aria-labelledby="band-title" className="on-ink relative overflow-hidden">
          <div className="absolute inset-x-0 -top-[14%] -bottom-[14%]" data-parallax="0.22" aria-hidden="true">
            <Image src={bandImage} alt="" fill sizes="100vw" className="parallax object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
            <div className="forge-glow absolute inset-0" />
          </div>
          <div className="wrap relative grid gap-12 py-28 lg:grid-cols-12 lg:py-40">
            <div className="lg:col-span-7" data-reveal="left">
              <p className="label">{pg.text("band", "label")}</p>
              <h2 id="band-title" className="mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.4rem]">
                {pg.text("band", "title")} <span className="text-spark">{pg.text("band", "highlight")}</span>
              </h2>
              <p className="mt-6 max-w-[54ch] text-lg text-on-ink/80">
                {pg.text("band", "text")}
              </p>
            </div>
            <ul className="grid content-end gap-3 self-end lg:col-span-5" data-reveal="right">
              {services.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex items-center justify-between border border-white/15 bg-ink/50 px-5 py-4 backdrop-blur-md transition-colors hover:border-flame hover:bg-ink/80"
                  >
                    <span className="font-display text-xl font-extrabold uppercase [font-stretch:78%]">{s.title}</span>
                    <span aria-hidden="true" className="text-amber transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section> : null}
      </>
    ),
    projects: (
      <>
        {/* Projects ------------------------------------------------------------ */}
        {shown.length && pg.visible("projects") ? (
          <section aria-labelledby="projects-title" className="py-24 lg:py-32">
            <div className="wrap">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
                  id="projects-title"
                  label={pg.text("projects", "label")}
                  title={pg.text("projects", "title")}
                  intro={pg.text("projects", "intro")}
                />
                <Link href="/projects" className="link-arrow" data-reveal>
                  Full portfolio <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul data-stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p, i) => (
                  <li key={p.slug} data-reveal="photo" style={delay((i % 3) * 110)}>
                    <ProjectCard project={p} index={i} />
                  </li>
                ))}
              </ul>
              <div className="mt-12 text-center" data-reveal>
                <Link href="/projects" className="btn btn-secondary">
                  See the full portfolio <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </>
    ),
    process: (
      <>
        {/* Process ------------------------------------------------------------- */}
        {steps.length && pg.visible("process") ? (
          <section aria-labelledby="process-title" className="relative border-t border-line bg-paper-2">
            <div className="wrap relative grid gap-14 py-24 lg:grid-cols-12 lg:py-32">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionHeading
                    id="process-title"
                    label={pg.text("process", "label")}
                    title={pg.text("process", "title")}
                    intro={pg.text("process", "intro")}
                  />
                  <div className="photo-zoom relative mt-10 hidden aspect-[4/3] overflow-hidden lg:block" data-reveal>
                    <Image src={STOCK.cncSparks.src} alt={STOCK.cncSparks.alt} fill sizes="30vw" className="object-cover" />
                  </div>
                </div>
              </div>
              <ol data-stagger className="relative grid gap-4 sm:grid-cols-2 lg:col-span-8">
                {steps.map((s, i) => (
                  <li key={s.title} className="group relative border border-line bg-card p-7 transition-colors hover:border-flame/60 lg:p-8" data-reveal style={delay(i * 60)}>
                    <span className="font-display text-6xl font-extrabold leading-none text-line-strong transition-colors duration-300 [font-stretch:72%] group-hover:text-flame">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-xl [font-stretch:80%]">{s.title}</h3>
                    <p className="mt-2 text-sm text-steel-text">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}
      </>
    ),
    quality: (
      <>
        {/* Certifications ------------------------------------------------------ */}
        {pg.visible("quality") ? <section aria-labelledby="quality-title" className="py-24 lg:py-28">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                id="quality-title"
                label={pg.text("quality", "label")}
                title={pg.text("quality", "title")}
                intro={pg.text("quality", "intro")}
              />
              <Link href="/quality" className="link-arrow" data-reveal>
                Quality & certifications <span aria-hidden="true">→</span>
              </Link>
            </div>
            {certs.length ? (
              <ul data-stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {certs.map((c, i) => (
                  <li key={c.id} className="lift border border-line bg-card p-6 text-center" data-reveal style={delay(i * 70)}>
                    <p className="font-mono text-xs uppercase tracking-[0.12em]">{c.title}</p>
                    {c.validUntil ? (
                      <p className="mt-2 text-sm text-steel-text">
                        Valid to {new Date(c.validUntil).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-12 grid gap-6 border border-line bg-card p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center lg:p-10" data-reveal>
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center bg-flame font-mono text-lg font-semibold text-ink">
                  QA
                </span>
                <p className="max-w-[60ch] text-steel-text">
                  Our certification documents are being updated and will be listed here once current copies are verified.
                  Contact us for the documents your tender or pre-qualification requires.
                </p>
                <Link href="/quote?topic=certificates" className="btn btn-secondary btn-sm">
                  Request documents
                </Link>
              </div>
            )}
          </div>
        </section> : null}
      </>
    ),
    faq: (
      <>
        {/* FAQ ------------------------------------------------------------------ */}
        {faqs.length && pg.visible("faq") ? (
          <section aria-labelledby="faq-title" className="border-t border-line bg-paper-2 py-24 lg:py-28">
            <div className="wrap grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading id="faq-title" label={pg.text("faq", "label")} title={pg.text("faq", "title")} />
              </div>
              <div className="lg:col-span-8" data-reveal>
                <FaqList faqs={faqs} />
              </div>
            </div>
          </section>
        ) : null}
      </>
    ),
    contact: (
      <>
        {/* Contact + quick quote, over a spark photograph ----------------------- */}
        {pg.visible("contact") ? <section aria-labelledby="contact-title" className="on-ink relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-x-0 -top-[14%] -bottom-[14%]" data-parallax="0.18" aria-hidden="true">
            <Image src={STOCK.grinderSparks.src} alt="" fill sizes="100vw" className="object-cover opacity-35" />
            <div className="absolute inset-0 bg-ink/70" />
            <div className="forge-glow absolute inset-0" />
          </div>
          <div className="wrap relative grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col border border-white/10 bg-ink/75 p-7 backdrop-blur-md lg:p-9" data-reveal="left">
              <p className="label">Contact</p>
              <h2 id="contact-title" className="mt-4 text-3xl sm:text-4xl">
                {company.name}
              </h2>
              <p className="mt-3 text-steel-text">{pg.text("contact", "text")}</p>
              <dl className="mt-7 divide-y divide-line border-y border-line text-[0.95rem]">
                {company.phones.length ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr]">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-text">Phone</dt>
                    <dd className="flex flex-wrap gap-x-3">
                      {company.phones.map((p, i) => (
                        <span key={p.e164} className="flex gap-3">
                          {i ? <span aria-hidden="true" className="text-steel">·</span> : null}
                          <ContactLink channel="phone" href={`tel:${p.e164}`} className="font-mono hover:text-accent">
                            {p.display}
                          </ContactLink>
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {company.email ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr]">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-text">Email</dt>
                    <dd>
                      <ContactLink channel="email" href={`mailto:${company.email}`} className="break-all hover:text-accent">
                        {company.email}
                      </ContactLink>
                    </dd>
                  </div>
                ) : null}
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr]">
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-text">Address</dt>
                  <dd>{company.address}</dd>
                </div>
                {company.facebookUrl || company.instagramUrl ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr]">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-steel-text">Social</dt>
                    <dd className="flex gap-2">
                      {company.facebookUrl ? (
                        <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center border border-line-strong font-mono text-xs text-on-ink transition-colors hover:border-flame hover:bg-flame hover:text-ink" aria-label="Facebook (opens in a new tab)">
                          FB
                        </a>
                      ) : null}
                      {company.instagramUrl ? (
                        <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center border border-line-strong font-mono text-xs text-on-ink transition-colors hover:border-flame hover:bg-flame hover:text-ink" aria-label="Instagram (opens in a new tab)">
                          IG
                        </a>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
                {company.mapsUrl ? (
                  <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
                    Open in Google Maps <span aria-hidden="true">→</span>
                  </a>
                ) : null}
                {company.whatsapp ? <WhatsAppButton number={company.whatsapp} className="btn btn-whatsapp btn-sm" /> : null}
              </div>
            </div>

            <div className="border border-white/10 bg-ink/75 p-7 backdrop-blur-md lg:p-9" data-reveal="right">
              <p className="label">Request a quote</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{pg.text("contact", "quoteTitle")}</h2>
              <div className="mt-6">
                <QuickStart services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
              </div>
            </div>
          </div>
        </section> : null}
      </>
    ),
  };

  return <PageLayout page="home" sections={sections} />;
}
