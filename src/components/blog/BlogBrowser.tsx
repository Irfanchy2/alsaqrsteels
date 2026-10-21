"use client";

import Link from "next/link";
import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";
import type { BlogPostSummary } from "@/lib/content/types";

const PAGE = 9;
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

// The article list on /blog: type to search titles, summaries and topics,
// click a topic to filter, and "Show more" to load further cards, all
// instantly in the browser with no page reload. Every article is still in
// the page HTML, so search engines see the full list.
export default function BlogBrowser({ posts, tags }: { posts: BlogPostSummary[]; tags: string[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const query = useDeferredValue(q.trim().toLowerCase());

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (!tag || p.tags.includes(tag)) &&
          (!query || `${p.title} ${p.excerpt ?? ""} ${p.tags.join(" ")}`.toLowerCase().includes(query))
      ),
    [posts, tag, query]
  );
  const shown = filtered;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block lg:w-96">
          <span className="sr-only">Search articles</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-text" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search articles, e.g. welding, ADNOC, warehouse"
            className="input !ps-9"
          />
        </label>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text" aria-live="polite">
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
          {tag ? ` on “${tag}”` : ""}
        </p>
      </div>

      {tags.length ? (
        <ul className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Filter by topic">
          {[null, ...tags].map((t) => (
            <li key={t ?? "all"} className="flex-none">
              <button
                type="button"
                aria-pressed={tag === t}
                onClick={() => {
                  setTag(t);
                  setLimit(PAGE);
                }}
                className={`whitespace-nowrap border px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors ${
                  tag === t ? "border-flame bg-flame text-[#0a0a0a]" : "border-line bg-card text-steel-text hover:border-steel hover:text-on-ink"
                }`}
              >
                {t ?? "All topics"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {shown.length ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <li key={p.slug} hidden={i >= limit} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}>
              <article data-tilt className="lift group relative flex h-full flex-col overflow-hidden border border-line bg-card">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col border-t-4 border-flame p-5 sm:p-6">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-steel-text">
                    <time dateTime={p.publishedAt ?? undefined}>{fmt(p.publishedAt)}</time>
                    <span aria-hidden="true" className="h-1 w-1 bg-flame" />
                    <span>{p.readingMinutes} min read</span>
                  </p>
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
      ) : (
        <div className="mt-8 border border-dashed border-line-strong bg-card p-10 text-center">
          <p className="text-lg">No article matches that search.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTag(null);
            }}
            className="btn btn-secondary btn-sm mt-4"
          >
            Show all articles
          </button>
        </div>
      )}

      {filtered.length > limit ? (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn btn-secondary">
            Show more articles ({filtered.length - limit} more)
          </button>
        </div>
      ) : null}
    </div>
  );
}
