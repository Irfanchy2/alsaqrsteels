"use client";

import { useEffect, useState } from "react";

// "Scroll" cue at the foot of the home hero: a glowing welding rod that
// drips sparks downward. Clicking glides to the next section; it fades out
// as soon as the visitor starts scrolling.
export default function ScrollCue({ target }: { target: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = () => {
    const el = document.getElementById(target);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Scroll to the next section"
      className={`scroll-cue group absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 lg:flex ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.3em] text-on-ink-muted transition-colors group-hover:text-amber">Scroll</span>
      <span aria-hidden="true" className="scroll-cue__rod relative block h-9 w-[2px] overflow-hidden rounded-full bg-white/15">
        <span className="scroll-cue__glow absolute inset-x-0 top-0 h-5 rounded-full bg-gradient-to-b from-transparent via-amber to-flame" />
      </span>
      <span aria-hidden="true" className="scroll-cue__drip block h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_10px_3px_rgba(255,150,40,0.8)]" />
    </button>
  );
}
