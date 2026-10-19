"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SHOWCASE_PHOTOS } from "@/lib/content/stock";

// Things the workshop fabricates to order. Each tile opens a full-screen photo
// viewer for that kind of item (arrow keys, swipe, thumbnails; Esc closes).
const ITEMS: { title: string; blurb: string; photos: string; service: string }[] = [
  { title: "Steel Staircases", photos: "stair", blurb: "Straight and wrap stringer stairs with treads and handrails, fabricated to your drawings.", service: "steel-structures" },
  { title: "Ladders & Staircases", photos: "ladder", blurb: "Fixed access ladders with safety cages, and service stairs for plant and rooftops.", service: "steel-structures" },
  { title: "Parking Sheds", photos: "shed", blurb: "Column-and-rafter car parking sheds with bracing, sized to the bay layout.", service: "steel-structures" },
  { title: "Car Parking & Sun Shades", photos: "sunshade", blurb: "Shade structures for parking and outdoor areas, ready for your chosen cladding.", service: "steel-structures" },
  { title: "Steel Canopies", photos: "canopy", blurb: "Entrance and walkway canopies on welded steel frames.", service: "steel-structures" },
  { title: "Pergolas", photos: "pergola", blurb: "Steel pergola frames for gardens, terraces and commercial outdoor spaces.", service: "steel-structures" },
  { title: "Steel Gates", photos: "gate", blurb: "Swing and sliding gates for villas, compounds and industrial plots.", service: "steel-structures" },
  { title: "Fences", photos: "fence", blurb: "Boundary and security fencing with posts, rails, pickets or laser-cut panels.", service: "steel-structures" },
];

export default function FabricationShowcase({
  title = "Fabrication showcase",
  intro = "Typical items we fabricate and install for villas, compounds and industrial sites across the UAE. Open any item to see more photos, then request a quotation for your own design.",
}: {
  title?: string;
  intro?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [item, setItem] = useState(0);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const photos = SHOWCASE_PHOTOS[ITEMS[item].photos] ?? [];
  const count = photos.length;

  const open = (i: number) => {
    setItem(i);
    setIndex(0);
    dialog.current?.showModal();
  };
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = photos[index];

  return (
    <section aria-labelledby="showcase-title" className="on-ink bg-ink py-16 lg:py-24">
      <div className="wrap">
        <p className="label">Made to order</p>
        <h2 id="showcase-title" className="mt-4 text-4xl uppercase sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-[62ch] text-on-ink-muted">{intro}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it, i) => {
            const set = SHOWCASE_PHOTOS[it.photos] ?? [];
            const cover = set[0];
            return (
              <li key={it.title} data-reveal="photo" data-tilt className="group relative flex flex-col border border-line-ink bg-ink-2">
                <button
                  type="button"
                  onClick={() => open(i)}
                  className="photo-zoom relative block aspect-[4/3] w-full overflow-hidden bg-ink text-start"
                  aria-label={`View ${set.length} photos: ${it.title}`}
                >
                  {cover ? (
                    <Image src={cover.src} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : null}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 start-3 inline-flex items-center gap-2 bg-ink/80 px-2.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-on-ink backdrop-blur transition-colors group-hover:bg-flame group-hover:text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="1" />
                      <circle cx="9" cy="11" r="2" />
                      <path d="m21 17-5-5-8 8" />
                    </svg>
                    {set.length} photos
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl uppercase [font-stretch:78%]">
                    <button type="button" onClick={() => open(i)} className="text-start transition-colors hover:text-flame">
                      {it.title}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm text-on-ink-muted">{it.blurb}</p>
                  <Link
                    href={`/quote?service=${it.service}&topic=${encodeURIComponent(it.title)}`}
                    className="mt-auto pt-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-on-ink-muted transition-colors hover:text-amber"
                  >
                    Request a quote <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <dialog
        ref={dialog}
        aria-label={`${ITEMS[item].title} photos`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#08090b] p-0 text-on-ink"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="font-display text-xl font-extrabold uppercase [font-stretch:78%]">
              {ITEMS[item].title}
              <span className="ms-3 font-mono text-xs font-normal tracking-[0.12em] text-on-ink-muted">
                {count ? index + 1 : 0} / {count}
              </span>
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="flex h-11 w-11 items-center justify-center border border-white/20 text-2xl leading-none transition-colors hover:border-flame hover:bg-flame hover:text-ink"
              aria-label="Close photos"
            >
              ×
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {current ? (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="showcase-photo object-contain"
              />
            ) : null}
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute start-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ink/70 text-2xl backdrop-blur transition-colors hover:bg-flame hover:text-ink sm:start-6"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute end-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ink/70 text-2xl backdrop-blur transition-colors hover:bg-flame hover:text-ink sm:end-6"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <ul className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
            {photos.map((p, i) => (
              <li key={p.src} className="flex-none">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`relative block h-14 w-20 overflow-hidden border-2 transition-opacity sm:h-16 sm:w-24 ${
                    i === index ? "border-flame opacity-100" : "border-transparent opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image src={p.src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </section>
  );
}
