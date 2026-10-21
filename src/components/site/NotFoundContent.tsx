import Link from "next/link";
import Image from "next/image";
import { STOCK } from "@/lib/content/stock";

// 404: a full-screen workshop photo, rising sparks, and a giant "404" that a
// welding arc fills from left to right on load. Then four photo cards back
// into the site.
const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 41) % 100}%`,
  ["--t" as string]: `${5 + ((i * 7) % 5)}s`,
  ["--delay" as string]: `${(i * 0.5) % 6}s`,
  ["--dx" as string]: `${((i * 23) % 100) - 50}px`,
}));

const LINKS = [
  { href: "/services", label: "Services", text: "Structural steel, pipelines, CNC, tanks, stainless", photo: STOCK.steelRoofFrame },
  { href: "/projects", label: "Projects", text: "Work across Abu Dhabi, Dubai and the UAE", photo: STOCK.cranesDusk },
  { href: "/about", label: "About us", text: "Our Musaffah workshop, since 2010", photo: STOCK.factoryHall },
  { href: "/contact", label: "Contact", text: "Call, WhatsApp or visit the workshop", photo: STOCK.grindingWorker },
];

export default function NotFoundContent() {
  return (
    <>
      <section
        aria-labelledby="nf-title"
        className="on-ink grain relative -mt-[5.5rem] flex min-h-[100svh] items-center overflow-hidden pb-16 pt-[7.5rem] lg:-mt-[6.25rem] lg:pt-[8.5rem]"
      >
        <div className="absolute inset-x-0 -bottom-[14%] -top-[14%]" data-parallax="0.25" aria-hidden="true">
          <Image src={STOCK.weldingBlue.src} alt="" fill priority sizes="100vw" className="object-cover object-[60%_40%] opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
          <div className="forge-glow absolute inset-0" />
          <div className="sparks">
            {SPARKS.map((s, i) => (
              <i key={i} style={s} />
            ))}
          </div>
        </div>

        <div className="wrap relative grid w-full gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 lg:order-2" aria-hidden="true">
            <p className="nf-404 relative mx-auto w-fit select-none font-display font-extrabold leading-[0.82] [font-stretch:68%]">
              <span className="nf-404__outline">404</span>
              <span className="nf-404__fill">404</span>
              <span className="nf-404__arc" />
            </p>
            <p className="mt-6 text-center font-mono text-[0.72rem] uppercase tracking-[0.3em] text-on-ink-muted">Joint failed inspection</p>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <p className="label fade-up" style={{ ["--d" as string]: "80ms" }}>
              Error 404 · Page not found
            </p>
            <h1 id="nf-title" className="mt-5 text-[2.8rem] sm:text-6xl lg:text-[4.6rem]">
              <span className="line-mask">
                <span style={{ ["--d" as string]: "160ms" }}>This joint</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "300ms" }} className="text-spark">
                  didn&apos;t hold.
                </span>
              </span>
            </h1>
            <p className="fade-up mt-6 max-w-[52ch] text-lg text-on-ink/80" style={{ ["--d" as string]: "460ms" }}>
              The page you&apos;re looking for has moved or never existed. Links from our old website now live at new
              addresses. Pick a section below, or start from the home page.
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: "580ms" }}>
              <Link href="/" className="btn btn-primary">
                Back to home <span aria-hidden="true">→</span>
              </Link>
              <Link href="/quote" className="btn btn-secondary-ink">
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="nf-links" className="border-t border-line bg-paper-2 py-16 lg:py-20">
        <div className="wrap">
          <h2 id="nf-links" className="text-3xl sm:text-4xl">
            Where would you like to go?
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((l, i) => (
              <li
                key={l.href}
                data-reveal="photo"
                data-tilt
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
                className="photo-zoom group relative flex min-h-[16rem] flex-col justify-end overflow-hidden border border-line-ink bg-ink"
              >
                <Image src={l.photo.src} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-70" />
                <div aria-hidden="true" className="photo-shade absolute inset-0" />
                <div className="relative p-6">
                  <h3 className="text-2xl text-on-ink [font-stretch:78%]">
                    <Link href={l.href} className="after:absolute after:inset-0 group-hover:text-flame">
                      {l.label}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-on-ink/75">{l.text}</p>
                  <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-on-ink-muted transition-colors group-hover:text-amber">
                    Go <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
