import Link from "next/link";
import type { PageBlock } from "@/lib/types";
import SafeImage from "@/components/SafeImage";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import SparkField from "@/components/motion/SparkField";

// Old content occasionally still carries a bare relative path from the previous
// CMS (e.g. "services.html"). New content already uses real app routes
// ("/services", "mailto:...", "/contact#quote"). Pass through anything that
// already looks like a real link; only patch up the legacy shape.
function normalizeLink(link?: string): string {
  if (!link) return "#";
  if (/^(https?:|mailto:|tel:|#|\/)/.test(link)) return link;
  return "/" + link.replace(/\.html(?=$|#)/, "");
}

function SectionHead({
  eyebrow,
  heading,
  intro,
  dark,
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-[62ch]">
      {eyebrow && (
        <span
          className={`eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] ${
            dark ? "text-torch-dim" : "text-torch-text"
          }`}
        >
          {eyebrow}
        </span>
      )}
      {heading && (
        <h2
          className={`font-display font-extrabold uppercase tracking-[-0.02em] text-[2rem] sm:text-[2.6rem] leading-[1.05] mt-4 ${
            dark ? "text-hi-inv" : "text-hi"
          }`}
        >
          {heading}
        </h2>
      )}
      {intro && (
        <p className={`mt-4 text-[1.05rem] leading-relaxed ${dark ? "text-lo-inv" : "text-lo"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

const wrap = "max-w-[1240px] mx-auto px-5 sm:px-10";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Block({ block }: { block: PageBlock }) {
  const d = block.data ?? {};

  switch (block.block_type) {
    case "page_hero":
      return (
        <section className="bg-surface2 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className={wrap}>
            {d.breadcrumb && (
              <p className="font-mono text-[0.72rem] uppercase tracking-wide text-lo2 mb-6">
                <Link href="/" className="hover:text-hi">
                  Home
                </Link>{" "}
                / <span className="text-hi">{d.breadcrumb}</span>
              </p>
            )}
            {d.eyebrow && (
              <span className="eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-torch-text">
                {d.eyebrow}
              </span>
            )}
            <h1 className="font-display font-extrabold uppercase tracking-[-0.02em] text-[2.4rem] sm:text-[3.4rem] leading-[1.02] mt-4 max-w-[18ch]">
              {d.heading}
            </h1>
            {d.lede && (
              <p className="mt-6 text-[1.1rem] leading-relaxed text-lo max-w-[62ch]">
                {d.lede}
              </p>
            )}
          </div>
        </section>
      );

    case "industries": {
      const items: { name: string; body: string }[] = d.items ?? [];
      return (
        <section className="on-dark py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead eyebrow={d.eyebrow} heading={d.heading} intro={d.intro} dark />
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line-inv mt-14">
              {items.map((it, i) => (
                <StaggerItem key={i}>
                  <div className="bg-[#161a1e] p-8 sm:p-9 flex flex-col gap-3 h-full transition-colors duration-300 hover:bg-[#1c2126]">
                    <span className="font-mono text-[0.66rem] tracking-[0.16em] text-torch-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display font-extrabold uppercase tracking-[-0.02em] text-[1.3rem] leading-tight text-hi-inv">
                      {it.name}
                    </h3>
                    <p className="text-lo-inv text-[0.92rem] leading-relaxed">{it.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      );
    }

    case "numbered_cards": {
      const items: { number: string; title: string; body: string }[] = d.items ?? [];
      return (
        <section className="bg-surface2 py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead eyebrow={d.eyebrow} heading={d.heading} intro={d.intro} />
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line mt-14">
              {items.map((it, i) => (
                <StaggerItem key={i}>
                  <div className="bg-surface p-8 sm:p-9 relative overflow-hidden h-full transition-colors duration-300 hover:bg-surface2/60">
                    <span className="font-mono text-[0.72rem] font-semibold text-torch-text">
                      {it.number}
                    </span>
                    <h3 className="font-display font-extrabold uppercase text-[1.2rem] leading-tight mt-3">
                      {it.title}
                    </h3>
                    <p className="text-lo text-[0.92rem] leading-relaxed mt-3">{it.body}</p>
                    <span className="absolute -right-2 -bottom-4 font-display font-extrabold text-[5rem] text-line select-none">
                      {it.number}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      );
    }

    case "cta_banner":
      return (
        <section className="on-dark py-24 sm:py-28 relative overflow-hidden">
          <SparkField density={12} className="opacity-60" />
          <div className={`${wrap} relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8`}>
            <div>
              {d.eyebrow && (
                <span className="eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-torch-dim">
                  {d.eyebrow}
                </span>
              )}
              <h2 className="font-display font-extrabold uppercase tracking-[-0.02em] text-[2rem] sm:text-[2.6rem] leading-[1.05] mt-4 max-w-[20ch] text-hi-inv">
                {d.heading}
              </h2>
              {d.body && <p className="mt-4 text-lo-inv max-w-[55ch]">{d.body}</p>}
            </div>
            {d.btn_text && d.btn_link && (
              <Link
                href={normalizeLink(d.btn_link)}
                className="inline-flex shrink-0 items-center justify-center bg-torch text-white font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-7 py-4 hover:bg-torch-dim transition-colors"
              >
                {d.btn_text}
              </Link>
            )}
          </div>
        </section>
      );

    case "about_split": {
      const panelLines: string[] = (d.panel_items ?? "")
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean);
      return (
        <section className="bg-bg py-24 sm:py-32">
          <div className={`${wrap} grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-14`}>
            <div>
              {d.eyebrow && (
                <span className="eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-torch-text">
                  {d.eyebrow}
                </span>
              )}
              {d.heading && (
                <h2 className="font-display font-extrabold uppercase tracking-[-0.02em] text-[2rem] sm:text-[2.4rem] leading-[1.05] mt-4 max-w-[24ch]">
                  {d.heading}
                </h2>
              )}
              {d.body && (
                <div
                  className="mt-6 text-lo leading-relaxed max-w-[62ch] [&>p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: d.body }}
                />
              )}
              <div className="flex flex-wrap gap-3.5 mt-8">
                {d.btn1_text && d.btn1_link && (
                  <Link
                    href={normalizeLink(d.btn1_link)}
                    className="inline-flex items-center bg-torch text-white font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-6 py-3.5 hover:bg-torch-dim transition-colors"
                  >
                    {d.btn1_text}
                  </Link>
                )}
                {d.btn2_text && d.btn2_link && (
                  <Link
                    href={normalizeLink(d.btn2_link)}
                    className="inline-flex items-center border border-line text-hi font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-6 py-3.5 hover:border-torch-text transition-colors"
                  >
                    {d.btn2_text}
                  </Link>
                )}
              </div>
            </div>
            {panelLines.length > 0 && (
              <div className="bg-surface2 border border-line p-8 sm:p-9">
                {d.panel_eyebrow && (
                  <span className="eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-torch-text">
                    {d.panel_eyebrow}
                  </span>
                )}
                <ul className="mt-5 space-y-4">
                  {panelLines.map((line, i) => {
                    const m = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
                    return (
                      <li key={i} className="text-[0.95rem] leading-relaxed text-lo border-t border-line pt-4 first:border-t-0 first:pt-0">
                        {m ? (
                          <>
                            <span className="font-display font-bold text-hi">{m[1]}</span>{" "}
                            {m[2]}
                          </>
                        ) : (
                          line
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      );
    }

    case "capability_specs": {
      const items: { label: string; value: string }[] = d.items ?? [];
      return (
        <section className="bg-surface2 py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead eyebrow={d.eyebrow} heading={d.heading} intro={d.intro} />
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line mt-14">
              {items.map((it, i) => (
                <StaggerItem key={i}>
                  <div className="bg-surface px-6 py-5 flex items-baseline justify-between gap-4 h-full transition-colors duration-300 hover:bg-surface2/60">
                    <dt className="font-mono text-[0.72rem] uppercase tracking-wide text-lo2">
                      {it.label}
                    </dt>
                    <dd className="font-display font-semibold text-[0.95rem] text-hi text-right">
                      {it.value}
                    </dd>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
            {d.note && (
              <p className="text-lo2 text-[0.85rem] leading-relaxed max-w-[70ch] mt-8">
                {d.note}
              </p>
            )}
          </div>
        </section>
      );
    }

    case "cert_block": {
      const items: { code: string; title: string; body?: string; image?: string | null }[] =
        d.items ?? [];
      return (
        <section className="bg-bg py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead eyebrow={d.eyebrow} heading={d.heading} intro={d.intro} />
            <StaggerGroup className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-14">
              {items.map((it, i) => (
                <StaggerItem key={i}>
                  <div className="bg-surface border border-line p-5 flex flex-col gap-3 h-full transition-shadow duration-300 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.2)]">
                    <div className="relative w-full aspect-[3/4]">
                      <SafeImage
                        src={it.image}
                        alt={it.title}
                        variant="certificate"
                        label={it.code}
                        fill
                        imgClassName="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-mono text-[0.68rem] font-semibold text-torch-text">
                        {it.code}
                      </p>
                      <p className="font-display font-semibold text-[0.85rem] text-hi leading-tight mt-1">
                        {it.title}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
            {d.more_text && d.more_link && (
              <Link
                href={normalizeLink(d.more_link)}
                className="inline-flex items-center mt-10 font-mono text-[0.85rem] font-semibold uppercase tracking-wide text-torch-text hover:text-torch-dim"
              >
                {d.more_text}
              </Link>
            )}
          </div>
        </section>
      );
    }

    case "rich_text":
      return (
        <section className="bg-bg py-16 sm:py-20">
          <div className={wrap}>
            {d.heading && (
              <h2 className="font-display font-extrabold uppercase text-[1.6rem] mb-6">
                {d.heading}
              </h2>
            )}
            <div
              className="prose-block max-w-[70ch] text-lo leading-relaxed [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: d.html ?? d.body ?? "" }}
            />
          </div>
        </section>
      );

    case "faq": {
      const items: { q: string; a: string }[] = d.items ?? [];
      return (
        <section className="bg-bg py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead eyebrow={d.eyebrow} heading={d.heading} intro={d.intro} />
            <div className="mt-12 divide-y divide-line max-w-[80ch]">
              {items.map((it, i) => (
                <details key={i} className="py-5 group">
                  <summary className="cursor-pointer list-none flex items-center justify-between font-display font-semibold text-[1.05rem]">
                    {it.q}
                    <span className="text-torch-text text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-lo mt-3 leading-relaxed">{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "contact_split":
      return (
        <section className="bg-bg py-16 sm:py-20">
          <div className={wrap}>
            {d.heading && (
              <h2 className="font-display font-extrabold uppercase text-[1.6rem] mb-4">
                {d.heading}
              </h2>
            )}
            {d.body && <p className="text-lo max-w-[60ch]">{d.body}</p>}
          </div>
        </section>
      );

    default:
      return null;
  }
}
