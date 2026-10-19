import Image from "next/image";
import type { ImageRef } from "@/lib/content/types";
import { STOCK } from "@/lib/content/stock";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";

// Inner-page header: a full-bleed workshop photograph under a deep shade and
// weld-glow wash, condensed uppercase title that slides up on load, closed by
// a red-to-amber spark rule.
export default function PageHero({
  crumbs,
  label,
  title,
  lede,
  image = STOCK.factoryHall,
  children,
}: {
  crumbs: Crumb[];
  label?: string;
  title: string;
  lede?: string;
  image?: ImageRef | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="on-ink grain relative -mt-[5.5rem] lg:-mt-[6.25rem] overflow-hidden pt-[5.5rem] lg:pt-[6.25rem]">
      {image ? (
        <div className="absolute inset-0" aria-hidden="true">
          <Image src={image.src} alt="" fill priority sizes="100vw" className="kenburns object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />
          <div className="forge-glow absolute inset-0" />
        </div>
      ) : (
        <div className="yard-grid absolute inset-0" aria-hidden="true" />
      )}
      <div className="wrap relative pb-16 pt-12 lg:pb-24 lg:pt-20">
        <Breadcrumbs items={crumbs} onInk />
        <div className="mt-10 max-w-4xl lg:mt-14">
          {label ? (
            <p className="label fade-up" style={{ ["--d" as string]: "60ms" }}>
              {label}
            </p>
          ) : null}
          <h1 className="mt-5 text-[2.7rem] sm:text-6xl lg:text-[5rem]">
            <span className="line-mask">
              <span style={{ ["--d" as string]: "120ms" }}>{title}</span>
            </span>
          </h1>
          {lede ? (
            <p className="fade-up mt-6 max-w-[60ch] text-lg text-on-ink-muted sm:text-xl" style={{ ["--d" as string]: "260ms" }}>
              {lede}
            </p>
          ) : null}
          {children}
        </div>
      </div>
      <div className="spark-rule relative" aria-hidden="true" />
    </section>
  );
}
