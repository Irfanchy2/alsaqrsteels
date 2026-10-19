"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";

// Accessible gallery: thumbnails are real buttons; the viewer is a native
// modal <dialog> (focus trapped, Esc closes) with arrow-key navigation.
export default function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(document.dir === "rtl" ? -1 : 1);
      if (e.key === "ArrowLeft") go(document.dir === "rtl" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!count) return null;
  const current = images[index];

  return (
    <>
      <ul data-stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src} data-reveal="photo" className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden border border-ink bg-paper-2"
              aria-label={`Open photo ${i + 1} of ${count}: ${img.alt || title}`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading={i < 3 ? "eager" : "lazy"}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={`${title} — photographs`}
        className="m-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-on-ink backdrop:bg-black/90"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="font-mono text-sm" aria-live="polite">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              className="inline-flex h-11 min-w-11 items-center justify-center border border-white/40 px-3 text-sm"
              onClick={() => dialog.current?.close()}
            >
              Close
            </button>
          </div>
          <figure className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-4 sm:px-16">
            <div className="relative flex-1">
              <Image key={current.src} src={current.src} alt={current.alt || title} fill sizes="100vw" className="object-contain" />
            </div>
            {current.alt ? <figcaption className="mt-3 text-center text-sm text-on-ink-muted">{current.alt}</figcaption> : null}
          </figure>
          {count > 1 ? (
            <div className="flex justify-center gap-3 pb-6">
              <button type="button" className="btn btn-secondary-ink btn-sm" onClick={() => go(-1)} aria-label="Previous photo">
                ← Previous
              </button>
              <button type="button" className="btn btn-secondary-ink btn-sm" onClick={() => go(1)} aria-label="Next photo">
                Next →
              </button>
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
