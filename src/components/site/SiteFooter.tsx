import Link from "next/link";
import Image from "next/image";
import type { Company, Service } from "@/lib/content/types";
import ContactLink from "./ContactLink";
import WhatsAppButton from "./WhatsAppButton";

export default function SiteFooter({ company, services }: { company: Company; services: Service[] }) {
  const year = new Date().getFullYear();
  return (
    <footer data-site-footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="wrap relative grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5 lg:col-span-4">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label={`${company.name} — home`}>
            <Image
              src="/brand/logo-on-dark.webp"
              alt={company.name}
              width={480}
              height={208}
              className="h-28 w-auto sm:h-32"
              sizes="260px"
            />
          </Link>
          <p className="mt-6 max-w-sm text-[0.95rem] text-on-ink-muted">{company.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote" className="btn btn-primary btn-sm">
              Request a quote
            </Link>
            {company.whatsapp ? <WhatsAppButton number={company.whatsapp} className="btn btn-secondary-ink btn-sm" /> : null}
          </div>
        </div>

        <nav aria-label="Services" className="md:col-span-3 lg:col-span-3">
          <h2 className="text-sm font-semibold text-on-ink">Services</h2>
          <ul className="mt-5 space-y-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-on-ink">Company</h2>
          <ul className="mt-5 space-y-1">
            {[
              ["/about", "About"],
              ["/projects", "Projects"],
              ["/quality", "Quality"],
              ["/contact", "Contact"],
              ["/blog", "Blog"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-12 lg:col-span-3">
          <h2 className="text-sm font-semibold text-on-ink">Workshop</h2>
          <address className="mt-5 not-italic text-[0.95rem] leading-relaxed">{company.address}</address>
          <ul className="mt-5 space-y-1 text-[0.95rem]">
            {company.phones.map((p) => (
              <li key={p.e164}>
                <ContactLink channel="phone" href={`tel:${p.e164}`} className="inline-flex min-h-10 items-center font-mono transition-colors hover:text-white">
                  {p.display}
                </ContactLink>
              </li>
            ))}
            {company.email ? (
              <li>
                <ContactLink channel="email" href={`mailto:${company.email}`} className="inline-flex min-h-10 items-center break-all transition-colors hover:text-white">
                  {company.email}
                </ContactLink>
              </li>
            ) : null}
          </ul>
          {company.hours ? <p className="mt-4 text-sm text-on-ink-muted">{company.hours}</p> : null}
        </div>
      </div>

      <div className="relative border-t border-line-ink">
        <div className="wrap flex flex-col gap-3 py-6 text-sm text-on-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-on-ink">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-10 items-center hover:text-on-ink">
                Terms
              </Link>
            </li>
            {company.facebookUrl ? (
              <li>
                <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center hover:text-on-ink">
                  Facebook
                </a>
              </li>
            ) : null}
            {company.instagramUrl ? (
              <li>
                <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center hover:text-on-ink">
                  Instagram
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/admin" className="inline-flex min-h-10 items-center hover:text-on-ink" prefetch={false}>
                Staff
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
