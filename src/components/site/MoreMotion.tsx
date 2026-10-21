"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Three small extra effects, each switchable in Admin → Motion:
//   progress  – a thin orange bar at the top that fills as the page scrolls;
//   countUp   – big numbers ("15+", "500") count up from zero when seen;
//   magnetic  – primary buttons lean towards the mouse (computers only).
// All skip themselves for visitors who ask for reduced motion.
export default function MoreMotion({ progress, countUp, magnetic }: { progress: boolean; countUp: boolean; magnetic: boolean }) {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    if (progress && bar.current) {
      const el = bar.current;
      let frame = 0;
      const update = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0})`;
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame) cancelAnimationFrame(frame);
      });
    }

    if (countUp && !reduce) {
      // A number with an optional prefix/suffix; years (e.g. 2010) stay as they are.
      const pattern = /^(\D*)(\d[\d,]*)(\D*)$/;
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-count], main dd.font-display")).filter((el) => {
        if (el.children.length) return false;
        const m = el.textContent?.trim().match(pattern);
        if (!m) return false;
        const n = Number(m[2].replace(/,/g, ""));
        return n > 0 && !(n >= 1900 && n <= 2100);
      });
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            const el = e.target as HTMLElement;
            const original = el.textContent!.trim();
            const [, pre, num, post] = original.match(pattern)!;
            const end = Number(num.replace(/,/g, ""));
            const t0 = performance.now();
            const dur = 1400;
            const tick = (t: number) => {
              const k = Math.min(1, (t - t0) / dur);
              const eased = 1 - Math.pow(1 - k, 3);
              el.textContent = k < 1 ? `${pre}${Math.round(end * eased).toLocaleString("en-US")}${post}` : original;
              if (k < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.6 }
      );
      targets.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    if (magnetic && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const onMove = (e: PointerEvent) => {
        const btn = (e.target as Element | null)?.closest<HTMLElement>(".btn-primary");
        document.querySelectorAll<HTMLElement>(".btn-primary.is-magnet").forEach((b) => {
          if (b !== btn) {
            b.classList.remove("is-magnet");
            b.style.translate = "";
          }
        });
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
        btn.classList.add("is-magnet");
        btn.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => document.removeEventListener("pointermove", onMove));
    }

    return () => cleanups.forEach((c) => c());
  }, [pathname, progress, countUp, magnetic]);

  return progress ? <div ref={bar} aria-hidden="true" className="scroll-progress" /> : null;
}
