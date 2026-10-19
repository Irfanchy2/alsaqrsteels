import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import type { BlogPostSummary } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import Illustration from "@/components/ui/Illustration";
import { STOCK } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Steel Fabrication Notes",
  description:
    "Practical notes on structural steel, welding procedures, inspection, coatings and fabrication schedules from the Al Saqr Al Ahmar workshop in Musaffah, Abu Dhabi.",
  alternates: { canonical: "/blog" },
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const DRAWINGS = ["ibeam", "pipe", "tank", "rail", "cnc"] as const;

function Cover({ post, i, sizes, priority = false }: { post: BlogPostSummary; i: number; sizes: string; priority?: boolean }) {
  return post.image ? (
    <Image
      src={post.image}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
    />
  ) : (
    <div className="yard-grid absolute inset-0 flex items-center justify-center bg-ink-2 text-on-ink-muted" aria-hidden="true">
      <Illustration
        name={DRAWINGS[i % DRAWINGS.length]}
        className="h-[58%] w-[58%] opacity-30 transition-all duration-700 group-hover:scale-105 group-hover:opacity-50"
      />
    </div>
  );
}

function Meta({ post, onInk = false }: { post: BlogPostSummary; onInk?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] ${onInk ? "text-on-ink-muted" : "text-steel-text"}`}>
      <time dateTime={post.publishedAt ?? undefined}>{fmt(post.publishedAt)}</time>
      <span aria-hidden="true" className="h-1 w-1 bg-flame" />
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const [lead, ...rest] = posts;
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 12);

  return (
    <>
      <PageHero
        image={STOCK.weldingBlue}
        crumbs={[{ name: "Blog", href: "/blog" }]}
        label="Blog"
        title="Notes from the workshop"
        lede="Practical background on structural steel, welding, inspection and fabrication schedules — the questions that come up in real enquiries. For advice on your project, talk to our team."
      />

      <section className="py-14 lg:py-20">
        <div className="wrap">
          {lead ? (
            <>
              {/* Latest post ------------------------------------------------ */}
              <article className="edge-draw group relative grid overflow-hidden bg-ink text-on-ink lg:grid-cols-12" data-reveal>
                <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
                  <Cover post={lead} i={0} sizes="(min-width: 1024px) 58vw, 100vw" priority />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/40" />
                  <span className="absolute start-4 top-4 bg-flame px-2.5 py-1 font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink">
                    Latest
                  </span>
                </div>
                <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
                  <Meta post={lead} onInk />
                  <h2 className="mt-4 text-[1.9rem] leading-[1.02] sm:text-4xl">
                    <Link href={`/blog/${lead.slug}`} className="after:absolute after:inset-0 group-hover:text-flame">
                      {lead.title}
                    </Link>
                  </h2>
                  {lead.excerpt ? <p className="mt-4 text-on-ink-muted">{lead.excerpt}</p> : null}
                  <p className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-amber">
                    Read the article <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </article>

              {tags.length ? (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label="Topics covered">
                  {tags.map((t) => (
                    <li key={t} className="border border-line bg-card px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-steel-text">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* All posts ------------------------------------------------- */}
              {rest.length ? (
                <ul data-stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <li key={p.slug}>
                      <article className="lift group relative flex h-full flex-col border border-line bg-card">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Cover post={p} i={i + 1} sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" />
                        </div>
                        <div className="flex flex-1 flex-col border-t-4 border-flame p-5 sm:p-6">
                          <Meta post={p} />
                          <h2 className="mt-3 text-xl leading-tight [font-stretch:80%] sm:text-[1.4rem]">
                            <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                              {p.title}
                            </Link>
                          </h2>
                          {p.excerpt ? <p className="mt-3 line-clamp-3 text-[0.95rem] text-steel-text">{p.excerpt}</p> : null}
                          <p className="mt-auto flex items-center gap-2 pt-5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
                            Read <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </p>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <div className="border border-dashed border-line-strong bg-card p-10 text-center">
              <p className="text-lg">New articles are on the way.</p>
              <p className="mt-2 text-steel-text">In the meantime, send us your drawings and we&rsquo;ll answer your questions directly.</p>
              <Link href="/quote" className="btn btn-primary mt-6">
                Request a Quote
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
