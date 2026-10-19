import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getBlogPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getBlogPost(slug), getBlogPosts()]);
  if (!post) notFound();
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <header className="on-ink relative overflow-hidden">
        {post.image ? (
          <>
            <Image src={post.image} alt="" fill priority sizes="100vw" className="kenburns object-cover opacity-35" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          </>
        ) : null}
        <div className="yard-grid absolute inset-0" aria-hidden="true" />
        <div className="wrap relative pb-12 pt-10 lg:pb-16 lg:pt-14">
          <Breadcrumbs onInk items={[{ name: "Blog", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />
          {post.tags.length ? (
            <p className="fade-up mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="border border-line-ink px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-amber">
                  {t}
                </span>
              ))}
            </p>
          ) : null}
          <h1 className="line-mask mt-5 max-w-4xl text-[2.2rem] leading-[1] sm:text-6xl">
            <span>{post.title}</span>
          </h1>
          {post.excerpt ? (
            <p className="fade-up mt-6 max-w-2xl text-lg text-on-ink-muted" style={{ ["--d" as string]: "200ms" }}>
              {post.excerpt}
            </p>
          ) : null}
          <p className="fade-up mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.12em] text-on-ink-muted" style={{ ["--d" as string]: "320ms" }}>
            {post.author ? <span>{post.author}</span> : null}
            {post.author ? <span aria-hidden="true" className="h-1 w-1 bg-flame" /> : null}
            <time dateTime={post.publishedAt ?? undefined}>{fmt(post.publishedAt)}</time>
            <span aria-hidden="true" className="h-1 w-1 bg-flame" />
            <span>{post.readingMinutes} min read</span>
          </p>
        </div>
        <div className="spark-rule relative" aria-hidden="true" />
      </header>

      <div className="wrap grid gap-12 py-12 lg:grid-cols-12 lg:py-16">
        {/* Staff-written article, sanitised on save and on display (src/lib/html.ts). */}
        <div className="prose article text-[1.05rem] lg:col-span-8" dangerouslySetInnerHTML={{ __html: post.content }} />

        <aside className="lg:col-span-4">
          <div className="on-ink border-t-4 border-flame p-6 lg:sticky lg:top-24">
            <p className="label">Have a project?</p>
            <p className="mt-3 text-on-ink-muted">
              This article is general background, not advice for a specific project. Send us the drawings and specification and we&rsquo;ll
              answer for your job.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/quote" className="btn btn-primary btn-sm">
                Request a Quote
              </Link>
              <Link href="/blog" className="btn btn-secondary-ink btn-sm">
                All articles
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {more.length ? (
        <section aria-labelledby="more-title" className="border-t border-line bg-paper-2 py-14 lg:py-20">
          <div className="wrap">
            <p className="label">Keep reading</p>
            <h2 id="more-title" className="mt-3 text-3xl sm:text-4xl">
              More from the blog
            </h2>
            <ul data-stagger className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <article className="lift group relative flex h-full flex-col border border-line border-t-4 border-t-flame bg-card p-6">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-steel-text">
                      {fmt(p.publishedAt)} · {p.readingMinutes} min read
                    </p>
                    <h3 className="mt-3 text-xl leading-tight [font-stretch:80%]">
                      <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                        {p.title}
                      </Link>
                    </h3>
                    {p.excerpt ? <p className="mt-3 line-clamp-3 text-[0.95rem] text-steel-text">{p.excerpt}</p> : null}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          image: post.image ?? undefined,
          author: post.author ? { "@type": "Person", name: post.author } : { "@type": "Organization", name: "Al Saqr Al Ahmar" },
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        }}
      />
    </article>
  );
}
