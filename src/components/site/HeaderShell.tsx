"use client";

import { useEffect, useRef, useState } from "react";

// Sticky header chrome: turns solid once the page scrolls and drives the
// orange progress rail along its bottom edge. One passive listener, updates
// batched to animation frames.
export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      ref.current?.style.setProperty("--progress", max > 0 ? String(Math.min(1, y / max)) : "0");
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
    };
  }, []);

  return (
    <header
      ref={ref}
      data-site-header
      data-scrolled={scrolled ? "true" : "false"}
      className={`site-header on-ink sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-ink/85 backdrop-blur-md supports-[backdrop-filter]:bg-ink/75"
          : "border-transparent bg-gradient-to-b from-ink/80 to-transparent"
      }`}
    >
      {children}
      <span aria-hidden="true" className="scroll-rail absolute inset-x-0 bottom-0 h-[2px] bg-flame" />
    </header>
  );
}
