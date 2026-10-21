"use client";

import Link from "next/link";
import Image from "next/image";
import type { Block, CardItem, StatItem } from "@/lib/content/blocks";
import { str } from "@/lib/content/blocks";
import type { Project } from "@/lib/content/types";
import Gallery from "@/components/projects/Gallery";
import ProjectCard from "@/components/ui/ProjectCard";
import QuickStart from "@/components/quote/QuickStart";

export type BlockData = {
  services: { slug: string; title: string; summary: string; photo: string }[];
  projects: Project[];
};

const BG: Record<string, string> = {
  dark: "bg-paper",
  darker: "bg-ink border-y border-line",
  orange: "bg-flame text-ink",
};

const img = (src: string, alt = "") => ({ src, alt, width: 1600, height: 1000 });
const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Renders one free block. Used by the website and inside the page builder. */
export default function BlockView({ block, data, editing = false }: { block: Block; data?: BlockData; editing?: boolean }) {
  const p = block.props;
  const bg = BG[str(p.background, "dark")] ?? BG.dark;
  const onOrange = str(p.background) === "orange";

  switch (block.type) {
    case "heading": {
      const center = str(p.align) === "center";
      return (
        <section className={`${bg} py-16 lg:py-20`}>
          <div className={`wrap ${center ? "text-center" : ""}`}>
            <div className={`max-w-3xl ${center ? "mx-auto" : ""}`} data-reveal>
              {str(p.eyebrow) ? <p className={`label ${onOrange ? "!text-ink" : ""}`}>{str(p.eyebrow)}</p> : null}
              <h2 className="mt-4 text-[2rem] sm:text-5xl">{str(p.title)}</h2>
              {str(p.text) ? <p className={`mt-5 text-lg ${onOrange ? "" : "text-steel-text"}`}>{str(p.text)}</p> : null}
            </div>
          </div>
        </section>
      );
    }
    case "text":
      return (
        <section className={`${bg} py-14 lg:py-16`}>
          <div className="wrap">
            <div className="max-w-3xl" data-reveal>
              {str(p.title) ? <h2 className="mb-6 text-3xl sm:text-4xl">{str(p.title)}</h2> : null}
              <div className="space-y-4 text-lg leading-relaxed">
                {paras(str(p.body)).map((t, i) => (
                  <p key={i} className={onOrange ? "" : i ? "text-steel-text" : ""}>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    case "image": {
      const full = str(p.size) === "full";
      const url = str(p.url);
      return (
        <section className={full ? "" : "py-10 lg:py-14"}>
          <figure className={full ? "" : "wrap"} data-reveal="photo">
            <div className={`relative overflow-hidden bg-ink ${full ? "aspect-[21/9]" : "aspect-[16/9] rounded-sm"}`}>
              {url ? <Image src={url} alt={str(p.caption)} fill sizes="100vw" className="object-cover" /> : <Empty />}
            </div>
            {str(p.caption) ? <figcaption className={`mt-3 text-sm text-steel-text ${full ? "wrap" : ""}`}>{str(p.caption)}</figcaption> : null}
          </figure>
        </section>
      );
    }
    case "imageText": {
      const right = str(p.side) === "right";
      const url = str(p.url);
      return (
        <section className={`${bg} py-16 lg:py-24`}>
          <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className={`photo-zoom relative aspect-[4/3] overflow-hidden rounded-sm bg-ink ${right ? "lg:order-2" : ""}`} data-reveal="photo">
              {url ? <Image src={url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : <Empty />}
            </div>
            <div data-reveal={right ? "left" : "right"}>
              {str(p.eyebrow) ? <p className={`label ${onOrange ? "!text-ink" : ""}`}>{str(p.eyebrow)}</p> : null}
              <h2 className="mt-4 text-[2rem] sm:text-5xl">{str(p.title)}</h2>
              <div className="mt-6 space-y-4 text-lg">
                {paras(str(p.body)).map((t, i) => (
                  <p key={i} className={onOrange ? "" : "text-steel-text"}>
                    {t}
                  </p>
                ))}
              </div>
              {str(p.buttonLabel) ? (
                <Link href={str(p.buttonHref, "/quote")} className={`btn mt-8 ${onOrange ? "btn-dark" : "btn-primary"}`} onClick={editing ? (e) => e.preventDefault() : undefined}>
                  {str(p.buttonLabel)} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
    case "gallery": {
      const images = (Array.isArray(p.images) ? (p.images as string[]) : []).filter(Boolean);
      return (
        <section className="py-14 lg:py-20">
          <div className="wrap">
            {str(p.title) ? <h2 className="mb-8 text-3xl sm:text-4xl">{str(p.title)}</h2> : null}
            {images.length ? <Gallery images={images.map((u) => img(u))} title={str(p.title, "Photo")} /> : <Empty tall />}
          </div>
        </section>
      );
    }
    case "cards": {
      const items = (Array.isArray(p.items) ? (p.items as CardItem[]) : []).slice(0, 6);
      return (
        <section className={`${bg} py-16 lg:py-24`}>
          <div className="wrap">
            {str(p.title) ? <h2 className="mb-10 text-3xl sm:text-5xl" data-reveal>{str(p.title)}</h2> : null}
            <ul className={`grid gap-4 sm:grid-cols-2 ${items.length >= 3 ? "lg:grid-cols-3" : ""}`}>
              {items.map((c, i) => (
                <li key={i} data-reveal="photo" data-tilt className="group relative flex flex-col overflow-hidden border border-line-ink bg-ink-2 text-on-ink">
                  <div className="photo-zoom relative aspect-[4/3] overflow-hidden bg-ink">
                    {c.image ? <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" /> : null}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl [font-stretch:80%]">{c.title}</h3>
                    {c.text ? <p className="mt-2 text-on-ink-muted">{c.text}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }
    case "stats": {
      const items = (Array.isArray(p.items) ? (p.items as StatItem[]) : []).slice(0, 6);
      return (
        <section className={`${bg} py-14 lg:py-16`}>
          <dl className={`wrap grid grid-cols-2 gap-8 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {items.map((s, i) => (
              <div key={i} data-reveal>
                <dt className={`font-mono text-xs uppercase tracking-[0.16em] ${onOrange ? "" : "text-steel-text"}`}>{s.label}</dt>
                <dd className="mt-2 font-display text-5xl font-extrabold uppercase leading-none [font-stretch:72%] lg:text-6xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }
    case "banner": {
      const url = str(p.url);
      return (
        <section className="on-ink relative overflow-hidden">
          <div className="absolute inset-x-0 -bottom-[14%] -top-[14%]" data-parallax="0.2" aria-hidden="true">
            {url ? <Image src={url} alt="" fill sizes="(max-width: 768px) 70vw, 100vw" quality={50} className="object-cover opacity-50" /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
          </div>
          <div className="wrap relative py-24 lg:py-32">
            <div className="max-w-2xl" data-reveal>
              <h2 className="text-[2.4rem] sm:text-6xl">{str(p.title)}</h2>
              {str(p.text) ? <p className="mt-5 text-lg text-on-ink/80">{str(p.text)}</p> : null}
              {str(p.buttonLabel) ? (
                <Link href={str(p.buttonHref, "/quote")} className="btn btn-primary mt-8" onClick={editing ? (e) => e.preventDefault() : undefined}>
                  {str(p.buttonLabel)} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
    case "spacer": {
      const h = { small: "h-8", medium: "h-16", large: "h-28" }[str(p.size, "medium")] ?? "h-16";
      return (
        <div className={`${h} flex items-center`} aria-hidden="true">
          {str(p.line) === "yes" ? <div className="wrap w-full"><div className="h-px bg-line" /></div> : null}
        </div>
      );
    }
    case "servicesGrid": {
      const list = data?.services ?? [];
      return (
        <section className="py-16 lg:py-24">
          <div className="wrap">
            {str(p.title) ? <h2 className="mb-10 text-3xl sm:text-5xl" data-reveal>{str(p.title)}</h2> : null}
            {list.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <li key={s.slug} data-reveal="photo" data-tilt className="photo-zoom group relative flex min-h-[20rem] flex-col justify-end overflow-hidden border border-line-ink bg-ink">
                    <Image src={s.photo} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover opacity-75" />
                    <div aria-hidden="true" className="photo-shade absolute inset-0" />
                    <div className="relative p-6">
                      <h3 className="text-2xl text-on-ink [font-stretch:78%]">
                        <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0 group-hover:text-flame" onClick={editing ? (e) => e.preventDefault() : undefined}>
                          {s.title}
                        </Link>
                      </h3>
                      {s.summary ? <p className="mt-2 line-clamp-2 text-sm text-on-ink/75">{s.summary}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <LivePlaceholder text="Your services appear here as photo cards." />
            )}
          </div>
        </section>
      );
    }
    case "projectsGrid": {
      const n = Number(str(p.count, "3")) || 3;
      const list = (data?.projects ?? []).slice(0, n);
      return (
        <section className="py-16 lg:py-24">
          <div className="wrap">
            {str(p.title) ? <h2 className="mb-10 text-3xl sm:text-5xl" data-reveal>{str(p.title)}</h2> : null}
            {list.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((pr, i) => (
                  <li key={pr.slug} data-reveal="photo">
                    <ProjectCard project={pr} index={i} />
                  </li>
                ))}
              </ul>
            ) : (
              <LivePlaceholder text={`Your ${n} latest projects appear here.`} />
            )}
          </div>
        </section>
      );
    }
    case "quickQuote":
      return (
        <section className="border-y border-line bg-ink py-16 lg:py-24">
          <div className="wrap grid gap-10 lg:grid-cols-2">
            <div data-reveal>
              <h2 className="text-3xl sm:text-5xl">{str(p.title)}</h2>
              {str(p.text) ? <p className="mt-5 max-w-[48ch] text-lg text-steel-text">{str(p.text)}</p> : null}
            </div>
            <div className="border border-line bg-card p-6 sm:p-8">
              {editing ? (
                <LivePlaceholder text="The short quote form appears here." />
              ) : (
                <QuickStart services={(data?.services ?? []).map((s) => ({ slug: s.slug, title: s.title }))} />
              )}
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

function Empty({ tall = false }: { tall?: boolean }) {
  return <div className={`flex w-full items-center justify-center bg-ink-2 text-sm text-steel-text ${tall ? "h-48" : "h-full"}`}>Add a photo</div>;
}

function LivePlaceholder({ text }: { text: string }) {
  return <div className="flex h-40 items-center justify-center rounded border border-dashed border-line-strong text-sm text-steel-text">{text}</div>;
}
