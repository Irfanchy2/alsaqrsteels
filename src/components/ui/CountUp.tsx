"use client";

import { useEffect, useRef, useState } from "react";

// Counts a numeric value up once when it scrolls into view. Non-numeric values
// (e.g. "Detailing & CNC") render as-is. The final value is in the markup from
// the start, so crawlers, no-JS and reduced-motion visitors see the real figure.
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const match = /^(\d{1,4})(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const isYear = target !== null && target >= 1900 && target <= 2100;
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (target === null || isYear) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1100;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(`${Math.round(target * eased)}${match?.[2] ?? ""}`);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
