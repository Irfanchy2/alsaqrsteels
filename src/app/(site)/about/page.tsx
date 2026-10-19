import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPage, getCompany, getServices, getProcessSteps, getDocuments } from "@/lib/content";
import { WORK_PHOTOS } from "@/lib/content/seed";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryCta from "@/components/site/EnquiryCta";
import ContactLink from "@/components/site/ContactLink";
import { STOCK, photoRef } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About the Company and Workshop",
  description:
    "Al Saqr Al Ahmar Welding and Blacksmith LLC — a steel fabrication workshop in Musaffah Industrial 44, Abu Dhabi, established in 2010.",
  alternates: { canonical: "/about" },
};

const AUDIENCES = [
  ["Contractors", "Structural and miscellaneous steel packages, fabricated and installed."],
  ["Engineers and consultants", "Detailing and fabrication from your design drawings."],
  ["Procurement teams", "Clear scopes and written quotations against your enquiry documents."],
  ["Industrial operators", "Pipe supports, platforms, tanks and access steel for facilities."],
  ["Property owners", "Steelwork for buildings, workshops and warehouses."],
];

export default async function AboutPage() {
  const [company, services, steps, documents] = await Promise.all([
    getCompany(),
    getServices(),
    getProcessSteps(),
    getDocuments(),
  ]);
  const pg = await getPage("about");
  const profile = documents.find((d) => d.kind === "company_profile");
  const paragraphs = company.aboutBody.split(/\n\s*\n/);

  return (
    <>
      <PageHero
        image={pg.image("hero") ? photoRef(pg.image("hero")!) : STOCK.steelErection}
        crumbs={[{ name: "About", href: "/about" }]}
        label={pg.text("hero", "label")}
        title={pg.text("hero", "title", company.aboutTitle || "About the company")}
        lede={pg.text("hero", "lede")}
      >
        {profile ? (
          <a href={profile.fileUrl} className="btn btn-secondary mt-8" download>
            Download company profile (PDF{profile.fileSize ? `, ${(profile.fileSize / 1024 / 1024).toFixed(1)} MB` : ""})
          </a>
        ) : null}
      </PageHero>

      <section aria-labelledby="company-title" className="py-16 lg:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <h2 id="company-title" className="text-3xl font-bold sm:text-4xl">
              The company
            </h2>
            {paragraphs.map((p, i) => (
              <p key={i} className={`mt-5 ${i === 0 ? "text-lg" : "text-steel-text"}`}>
                {p}
              </p>
            ))}
            <dl className="mt-10 border-t-2 border-ink">
              {[
                ["Registered name", company.name],
                ["Established", company.establishedYear ? String(company.establishedYear) : null],
                ["Workshop", company.address],
                ["Hours", company.hours],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text sm:pt-1">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <figure className="lg:col-span-5 lg:col-start-8" data-reveal>
            <div className="relative aspect-[3/4] overflow-hidden border border-ink">
              <Image
                src={WORK_PHOTOS.steelFrame.src}
                alt={WORK_PHOTOS.steelFrame.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="parallax object-cover"
              />
            </div>
            <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel-text">
              Workshop yard, Musaffah Industrial 44
            </figcaption>
          </figure>
        </div>
      </section>

      {pg.visible("workshop") ? <section aria-labelledby="workshop-title" className="on-ink py-16 lg:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="workshop-title"
              label={pg.text("workshop", "label")}
              title={pg.text("workshop", "title")}
              intro={pg.text("workshop", "intro")}
            />
          </div>
          <ul data-stagger className="grid gap-px self-start border border-line-ink bg-line-ink sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {services.map((s) => (
              <li key={s.slug} className="bg-ink">
                <Link href={`/services/${s.slug}`} className="flex h-full flex-col p-6 hover:bg-ink-2">
                  <span className="font-mono text-xs text-accent-on-ink">{s.number}</span>
                  <span className="mt-2 text-lg font-semibold">{s.title}</span>
                  <span className="mt-2 text-sm text-on-ink-muted">{s.scope.slice(0, 2).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section> : null}

      {pg.visible("clients") ? <section aria-labelledby="clients-title" className="py-16 lg:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="clients-title" label={pg.text("clients", "label")} title={pg.text("clients", "title")} />
          </div>
          <ul className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
            {AUDIENCES.map(([who, what]) => (
              <li key={who} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[14rem_1fr] sm:gap-6" data-reveal>
                <span className="text-lg font-semibold">{who}</span>
                <span className="text-steel-text">{what}</span>
              </li>
            ))}
          </ul>
        </div>
      </section> : null}

      {steps.length && pg.visible("process") ? (
        <section aria-labelledby="steps-title" className="border-t border-line bg-paper-2 py-16 lg:py-24">
          <div className="wrap">
            <SectionHeading id="steps-title" label={pg.text("process", "label")} title={pg.text("process", "title")} />
            <ol data-stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="border-t-2 border-ink pt-5" data-reveal>
                  <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-steel-text">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="visit-title" className="py-16 lg:py-20">
        <div className="wrap flex flex-col gap-6 border-2 border-ink bg-card p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div>
            <h2 id="visit-title" className="text-2xl font-bold">
              Visiting the workshop
            </h2>
            <p className="mt-2 max-w-[60ch] text-steel-text">{company.address}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {company.mapsUrl ? (
              <ContactLink channel="maps" href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Open in Google Maps
              </ContactLink>
            ) : null}
            <Link href="/contact" className="btn btn-primary">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <EnquiryCta company={company} />
    </>
  );
}
