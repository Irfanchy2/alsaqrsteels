import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCompany, getCertifications, getDocuments } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryCta from "@/components/site/EnquiryCta";
import { STOCK } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Quality and Certifications",
  description:
    "How Al Saqr Al Ahmar controls quality from drawings to installation, and how to obtain current certification documents.",
  alternates: { canonical: "/quality" },
};

const PRINCIPLES = [
  {
    title: "Approved drawings first",
    body: "Drawings and detailing are prepared and submitted for your approval before fabrication starts.",
  },
  {
    title: "Cutting from the same information",
    body: "CNC profiling in our workshop works from the detailed drawings, so cut parts match what was approved.",
  },
  {
    title: "Your specification governs",
    body: "Include the project specification, applicable codes and any inspection requirements with your enquiry. They form part of the agreed scope.",
  },
  {
    title: "Scope agreed in writing",
    body: "Every quotation sets out the scope, programme and responsibilities, confirmed by our team before work begins.",
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function QualityPage() {
  const [company, certs, documents] = await Promise.all([getCompany(), getCertifications(), getDocuments()]);
  const certDocs = documents.filter((d) => d.kind === "certificate");

  return (
    <>
      <PageHero
        image={STOCK.grindingWorker}
        crumbs={[{ name: "Quality", href: "/quality" }]}
        label="Quality and certifications"
        title="Quality that starts at the drawing board"
        lede="How we control quality on a fabrication job — and how to obtain the certification documents your tender or pre-qualification needs."
      />

      <section aria-labelledby="approach-title" className="py-16 lg:py-24">
        <div className="wrap">
          <SectionHeading id="approach-title" label="Our approach" title="How quality is controlled" />
          <ol data-stagger className="mt-12 grid gap-6 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="border-t-2 border-ink pt-5" data-reveal>
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 max-w-[52ch] text-steel-text">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="certs-title" className="border-t border-line bg-paper-2 py-16 lg:py-24">
        <div className="wrap">
          <SectionHeading
            id="certs-title"
            label="Certification"
            title="Certificates"
            intro="We publish a certificate here only once a current copy in the company's name has been checked."
          />
          {certs.length ? (
            <ul data-stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((c) => (
                <li key={c.id} className="flex flex-col border border-ink bg-card" data-reveal>
                  {c.image ? (
                    <div className="relative aspect-[3/4] border-b border-ink bg-white">
                      <Image src={c.image.src} alt={`${c.title} certificate`} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-contain p-4" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-bold">{c.title}</h3>
                    <dl className="mt-3 space-y-1 text-sm">
                      {c.standard ? (
                        <div className="flex gap-2">
                          <dt className="text-steel-text">Standard:</dt>
                          <dd>{c.standard}</dd>
                        </div>
                      ) : null}
                      {c.issuer ? (
                        <div className="flex gap-2">
                          <dt className="text-steel-text">Issued by:</dt>
                          <dd>{c.issuer}</dd>
                        </div>
                      ) : null}
                      {c.certificateNumber ? (
                        <div className="flex gap-2">
                          <dt className="text-steel-text">Certificate no.:</dt>
                          <dd className="font-mono">{c.certificateNumber}</dd>
                        </div>
                      ) : null}
                      {c.validUntil ? (
                        <div className="flex gap-2">
                          <dt className="text-steel-text">Valid until:</dt>
                          <dd>{formatDate(c.validUntil)}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {c.fileUrl ? (
                      <a href={c.fileUrl} className="link-arrow mt-auto pt-5" target="_blank" rel="noopener noreferrer">
                        View certificate (PDF) <span aria-hidden="true">→</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 grid gap-6 border-2 border-ink bg-card p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div>
                <p className="text-xl font-semibold">Our certification documents are being updated.</p>
                <p className="mt-2 max-w-[62ch] text-steel-text">
                  If your tender, vendor registration or pre-qualification requires certificates, tell us which ones and
                  our team will respond with current copies or confirm their status.
                </p>
              </div>
              <Link href="/quote?service=other&topic=certificates" className="btn btn-primary">
                Request certificate copies
              </Link>
            </div>
          )}
          {certDocs.length ? (
            <ul className="mt-8 space-y-2">
              {certDocs.map((d) => (
                <li key={d.id}>
                  <a href={d.fileUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
                    {d.title} (PDF) <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <EnquiryCta
        company={company}
        title="Send us your specification"
        text="Attach the project specification and any inspection requirements with your drawings, and our team will review them with your request."
      />
    </>
  );
}
