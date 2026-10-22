"use client";

import { useEffect, useRef, useState } from "react";

// Silent looping background video for the home hero. The hero photo stays
// underneath as the first paint; the video is only fetched after the page has
// loaded, fades in once it can play, and is skipped for visitors who ask for
// reduced motion or data saving. Phones get the smaller 720p file.
export default function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pick = () => setSrc(window.matchMedia("(min-width: 900px)").matches ? "/video/hero-1280.mp4" : "/video/hero-720.mp4");
    if (document.readyState === "complete") pick();
    else {
      window.addEventListener("load", pick, { once: true });
      return () => window.removeEventListener("load", pick);
    }
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    v.play().catch(() => {});
    // Pause while the hero is off screen to save battery.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      className={`${className} transition-opacity duration-1000 ${ready ? "opacity-70" : "opacity-0"}`}
    />
  );
}
