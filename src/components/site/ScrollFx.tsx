"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-linked motion, driven by one passive scroll listener batched to
// animation frames and touching only transform/opacity:
//   [data-parallax="0.3"]  moves at a fraction of the scroll speed (depth);
//   [data-scroll-fade]     drifts up and fades as it scrolls out of view.
// Skips elements that are off screen, and does nothing for reduced motion.
export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const fades = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-fade]"));
    if (!parallax.length && !fades.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const speed = Number(el.dataset.parallax) || 0.2;
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(offset * -speed).toFixed(1)}px, 0)`;
      }
      for (const el of fades) {
        const host = (el.closest("section") as HTMLElement | null) ?? el;
        const r = host.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.7)));
        el.style.opacity = (1 - p).toFixed(3);
        el.style.transform = `translate3d(0, ${(p * -60).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      for (const el of [...parallax, ...fades]) {
        el.style.transform = "";
        el.style.opacity = "";
      }
    };
  }, [pathname]);

  return null;
}
