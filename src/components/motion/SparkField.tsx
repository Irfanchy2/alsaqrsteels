"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: "torch" | "hazard" | "white";
};

const COLORS: Record<Spark["hue"], string> = {
  torch: "255, 90, 31",
  hazard: "255, 179, 0",
  white: "255, 226, 190",
};

/**
 * Ambient welding-spark particle field. Small embers drift upward from the
 * bottom of the container, gently arcing sideways and cooling from bright
 * white-orange to a dim ember red as they fade. Purely decorative — sits
 * behind content with pointer-events disabled, and does nothing at all when
 * the viewer has requested reduced motion.
 */
export default function SparkField({
  className,
  density = 26,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const sparks: Spark[] = [];
    const maxParticles = density;

    function spawn() {
      if (sparks.length >= maxParticles) return;
      const hueRoll = Math.random();
      sparks.push({
        x: Math.random() * width,
        y: height + 6,
        vx: (Math.random() - 0.5) * 18,
        vy: -(28 + Math.random() * 46),
        life: 0,
        maxLife: 2.4 + Math.random() * 2.2,
        size: 1 + Math.random() * 1.8,
        hue: hueRoll < 0.55 ? "torch" : hueRoll < 0.85 ? "hazard" : "white",
      });
    }

    let last = performance.now();
    let spawnAccumulator = 0;
    let raf = 0;
    let running = true;

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      spawnAccumulator += dt;
      const spawnInterval = 1 / (maxParticles * 0.35);
      while (spawnAccumulator > spawnInterval) {
        spawn();
        spawnAccumulator -= spawnInterval;
      }

      ctx!.clearRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        // slight upward drag + gentle horizontal drift like rising heat
        s.vy += dt * 14;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const t = s.life / s.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const color = COLORS[s.hue];

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${color}, ${Math.max(alpha, 0) * 0.9})`;
        ctx!.shadowColor = `rgba(${color}, ${Math.max(alpha, 0) * 0.8})`;
        ctx!.shadowBlur = 6;
        ctx!.arc(s.x, s.y, s.size * (1 - t * 0.4), 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    />
  );
}
