"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";

export type ReelItem = { slug: string; title: string; summary: string; photo: ImageRef };

// Services as a horizontal reel: native scroll with snap points (swipe on
// touch, trackpad on desktop) plus previous/next buttons that move one panel.
// Buttons disable at either end so the controls always tell the truth.
export default function ServiceReel({ items }: { items: ReelItem[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="wrap mb-8 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-controls="service-reel"
          className="flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-on-ink transition-colors hover:border-on-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line-strong"
          aria-label="Previous service"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M11 3 5 9l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-controls="service-reel"
          className="flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-on-ink transition-colors hover:border-on-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line-strong"
          aria-label="Next service"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="m7 3 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <ul id="service-reel" ref={track} className="reel pb-2" aria-label="Services">
        {items.map((s, i) => (
          <li key={s.slug} className="group relative flex flex-col">
            <div className="photo-zoom relative aspect-[4/5] overflow-hidden rounded-sm bg-ink">
              <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 1024px) 30rem, 82vw" className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col pt-5">
              <p className="text-sm text-steel">
                {i + 1} of {items.length}
              </p>
              <h3 className="mt-1 text-[1.75rem] leading-tight">
                <Link
                  href={`/services/${s.slug}`}
                  className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-flame group-hover:decoration-2 group-hover:underline-offset-[6px]"
                >
                  {s.title}
                </Link>
              </h3>
              <p className="mt-3 max-w-[44ch] text-steel-text">{s.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
