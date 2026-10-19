"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Applies the admin's Motion & effects settings in the browser:
//  - speed: every CSS animation and transition runs at this rate (0.5×–2×),
//    including ones that start later (hover effects, page changes);
//  - tilt: photo cards marked data-tilt lean towards the mouse.
export default function MotionControl({ speed, tilt }: { speed: number; tilt: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (speed === 1) return;
    const apply = () => {
      for (const a of document.getAnimations()) if (a.playbackRate !== speed) a.playbackRate = speed;
    };
    apply();
    const onStart = () => apply();
    document.addEventListener("animationstart", onStart, true);
    document.addEventListener("transitionrun", onStart, true);
    return () => {
      document.removeEventListener("animationstart", onStart, true);
      document.removeEventListener("transitionrun", onStart, true);
    };
  }, [speed, pathname]);

  useEffect(() => {
    if (!tilt) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.transform = "";
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    };
    const move = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty("--tilt-x", `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--tilt-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    };
    const leave = () => {
      if (current) reset(current);
      current = null;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      if (current) reset(current);
    };
  }, [tilt, pathname]);

  return null;
}
