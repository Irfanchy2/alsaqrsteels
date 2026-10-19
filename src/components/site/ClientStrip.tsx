import Image from "next/image";
import type { ClientLogo } from "@/lib/content";

// "Trusted by teams across UAE industry" — the client logo strip carried over
// from the current alsaqrsteels.com. Logos sit on white plates in a slow
// marquee (paused on hover/focus), greyed until hovered. The first copy is
// the accessible list; the looping copies are hidden from assistive tech.
export default function ClientStrip({
  logos,
  title = "Trusted by teams across UAE industry",
  subtitle = "Across oil & gas, real estate and MEP.",
}: {
  logos: ClientLogo[];
  title?: string;
  subtitle?: string;
}) {
  // The last two words of the heading are set in the accent colour.
  const words = title.trim().split(/\s+/);
  const lead = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  if (logos.length === 0) return null;
  // Repeat short lists so one track is always wider than the screen.
  const reps = Math.max(1, Math.ceil(10 / logos.length));
  const row = Array.from({ length: reps }, () => logos).flat();

  return (
    <section aria-labelledby="clients-title" className="clients relative overflow-hidden border-b border-line bg-card">
      <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 top-0 block h-[3px] bg-flame" />
      <div className="wrap grid gap-8 py-12 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-14">
        <div className="min-w-0 lg:col-span-3" data-reveal="left">
          <p className="label">Clients</p>
          <h2 id="clients-title" className="mt-3 text-3xl sm:text-4xl">
            {lead} <span className="text-accent">{tail}</span>
          </h2>
          {subtitle ? <p className="mt-3 text-sm text-steel-text">{subtitle}</p> : null}
        </div>
        <div className="min-w-0 lg:col-span-9" data-reveal="right" style={{ ["--reveal-delay" as string]: "120ms" }}>
          <div className="marquee marquee--logos" role="region" aria-label="Client logos">
            {[0, 1].map((copy) => (
              <ul key={copy} className="marquee__track marquee__track--slow" aria-hidden={copy === 1 ? true : undefined}>
                {row.map((c, i) => {
                  const hidden = copy === 1 || i >= logos.length;
                  return (
                    <li key={`${copy}-${i}`} className="client-plate" aria-hidden={hidden && copy === 0 ? true : undefined}>
                      <Image
                        src={c.logo.src}
                        alt={hidden ? "" : c.logo.alt}
                        width={c.logo.width}
                        height={c.logo.height}
                        sizes="180px"
                        className="client-plate__img"
                      />
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
