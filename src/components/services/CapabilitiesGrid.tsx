"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { CAPABILITY_PHOTO } from "@/lib/content/stock";
import type { CapabilityCategory } from "@/lib/content/capabilities";

// Searchable, filterable grid of everything the workshop fabricates to order.
// Each tile shows a photo of that kind of work (from the shared image library)
// and links to the related service with the quote pre-filled.
export default function CapabilitiesGrid({ categories }: { categories: CapabilityCategory[] }) {
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");

  const items = useMemo(
    () =>
      categories
        .filter((c) => active === "all" || c.slug === active)
        .flatMap((c) => c.items.map((it) => ({ ...it, categoryTitle: c.title, categorySlug: c.slug, code: c.code }))),
    [categories, active]
  );

  const query = q.trim().toLowerCase();
  const shown = query
    ? items.filter((it) => (it.name + " " + it.blurb + " " + it.categoryTitle).toLowerCase().includes(query))
    : items;

  return (
    <div>
      <div className="flex flex-col gap-4 border-y-2 border-line-ink border-t-flame py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 -mb-1 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by discipline">
          <Chip label="All" active={active === "all"} onClick={() => setActive("all")} />
          {categories.map((c) => (
            <Chip key={c.slug} label={c.title.replace(" Fabrication", "").replace(" Works", "")} active={active === c.slug} onClick={() => setActive(c.slug)} />
          ))}
        </div>
        <label className="relative lg:w-72">
          <span className="sr-only">Search capabilities</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search capabilities…"
            className="w-full border border-line-ink bg-ink-2 py-2.5 pe-3 ps-9 font-mono text-sm text-on-ink placeholder:text-on-ink-muted focus:border-amber focus:outline-none"
          />
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </label>
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-on-ink-muted">
        {shown.length} {shown.length === 1 ? "capability" : "capabilities"}
      </p>

      {shown.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-px border border-line-ink bg-line-ink sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it) => (
            <li key={`${it.categorySlug}-${it.slug}`} className="min-w-0">
              <Link
                href={`/quote?service=${it.service}&topic=${encodeURIComponent(it.name)}`}
                className="group relative flex h-full gap-4 bg-ink-2 p-3 transition-colors duration-300 hover:bg-ink-3 sm:flex-col sm:gap-0 sm:p-5"
              >
                <div className="relative aspect-square w-28 flex-none overflow-hidden bg-ink sm:-mx-5 sm:-mt-5 sm:mb-4 sm:aspect-[16/10] sm:w-auto">
                  {CAPABILITY_PHOTO[it.slug] ? (
                    <Image
                      src={CAPABILITY_PHOTO[it.slug].src}
                      alt={CAPABILITY_PHOTO[it.slug].alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 112px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <span className="absolute end-2 top-2 hidden bg-ink/80 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-amber backdrop-blur sm:block">{it.code}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-mono text-[0.62rem] uppercase tracking-[0.14em] text-accent-on-ink">{it.categoryTitle}</p>
                  <h3 className="mt-1.5 text-lg text-on-ink [font-stretch:82%] group-hover:text-flame">{it.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[0.85rem] text-on-ink-muted sm:line-clamp-none">{it.blurb}</p>
                  <p className="mt-auto flex items-center gap-2 pt-2 font-mono sm:pt-4 text-[0.66rem] uppercase tracking-[0.12em] text-on-ink-muted transition-colors group-hover:text-amber">
                    Enquire <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 border border-dashed border-line-ink bg-ink-2 p-10 text-center text-on-ink-muted">
          <p>No capability matches “{q}”.</p>
          <p className="mt-2 text-sm">
            Tell us what you need to fabricate and we&rsquo;ll answer directly.{" "}
            <Link href="/quote" className="text-amber underline">
              Request a quote
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-none whitespace-nowrap border px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors ${
        active ? "border-flame bg-flame text-ink" : "border-line-ink text-on-ink-muted hover:border-steel hover:text-on-ink"
      }`}
    >
      {label}
    </button>
  );
}
