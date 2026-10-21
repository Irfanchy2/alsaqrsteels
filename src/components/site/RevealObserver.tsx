"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer for the whole page: elements with [data-reveal] fade up once
// as they enter the viewport. Children of [data-stagger] containers are
// revealed one after another. CSS only hides them when html.js is set and the
// visitor has not asked for reduced motion (see globals.css).
//
// Also drives the pointer "spotlight" on .spotlight cards (a soft glow that
// follows the cursor) through two CSS custom properties.
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        const el = child as HTMLElement;
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
        el.style.setProperty("--reveal-delay", `${Math.min(i, 7) * 80}ms`);
      });
    });

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    // Safety net: never leave content hidden if an observer callback is missed.
    // Only for what is already on screen or scrolled past, so content further
    // down still animates in when the visitor reaches it.
    const t = window.setTimeout(
      () =>
        els.forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
        }),
      2500
    );

    // Pause the always-running decorative animations (hazard tape, ticker,
    // welding arc) while they are off screen, so only what the visitor can
    // see is being painted. Smoother scrolling, less battery.
    const loops = Array.from(document.querySelectorAll<HTMLElement>(".hazard, .marquee, .weld"));
    let loopIo: IntersectionObserver | null = null;
    if (loops.length && "IntersectionObserver" in window) {
      loopIo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.target.classList.toggle("is-offscreen", !e.isIntersecting);
        },
        { rootMargin: "120px" }
      );
      loops.forEach((el) => loopIo!.observe(el));
    }

    return () => {
      io.disconnect();
      loopIo?.disconnect();
      window.clearTimeout(t);
    };
  }, [pathname]);

  // Enter animations (page fade, flame sweep) should run on in-app navigation
  // but not on the very first load, where they add a flash before the page is
  // even readable. Mark the document ready one frame after the first mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => document.documentElement.classList.add("nav-ready"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const card = (last.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${last.clientX - r.left}px`);
      card.style.setProperty("--my", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
