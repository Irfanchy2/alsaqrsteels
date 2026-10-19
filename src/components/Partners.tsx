import SafeImage from "@/components/SafeImage";
import type { Partner } from "@/lib/types";

const wrap = "max-w-[1240px] mx-auto px-5 sm:px-10";

/**
 * Scrolling client-logo strip, matching the "Trusted by teams across UAE
 * industry" marquee on the live site. Pure-CSS marquee (.client-marquee /
 * .client-track in globals.css) — no JS needed, so this stays a server
 * component. Logos are duplicated once so the loop is seamless.
 */
export default function Partners({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];

  return (
    <section className="bg-surface2 border-b border-line py-9">
      <div className={wrap}>
        <p className="text-center font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-lo2 mb-7">
          Trusted by teams across UAE industry
        </p>
      </div>
      <div className="client-marquee">
        <div className="client-track">
          {loop.map((p, i) => (
            <div key={`${p.id}-${i}`} className="client-chip shrink-0 px-8 sm:px-10">
              <SafeImage
                src={p.logo_url}
                alt={p.name}
                variant="logo"
                width={120}
                height={40}
                imgClassName="h-8 w-auto object-contain"
                className="text-lo2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
