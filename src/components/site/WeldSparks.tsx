"use client";

import { useEffect, useRef } from "react";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number };

// Click anywhere on the public site and a burst of welding sparks flies from
// the electrode tip: a white-hot flash, then orange and amber sparks that arc
// under gravity and fade. One full-screen canvas, drawn only while sparks are
// alive. Mouse/pen only (no touch), and off for reduced motion.
export default function WeldSparks() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let sparks: Spark[] = [];
    let flashes: { x: number; y: number; life: number }[] = [];
    let raf = 0;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const tick = (t: number) => {
      const dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016);
      last = t;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      for (const f of flashes) {
        f.life -= dt;
        const a = Math.max(0, f.life / 0.22);
        const r = 46 * (1.4 - a);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        g.addColorStop(0, `rgba(255,252,235,${a})`);
        g.addColorStop(0.35, `rgba(255,190,80,${a * 0.7})`);
        g.addColorStop(1, "rgba(255,90,31,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      flashes = flashes.filter((f) => f.life > 0);

      for (const s of sparks) {
        s.life -= dt;
        s.vy += 900 * dt; // gravity
        s.vx *= 0.985;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // Draw each spark as a streak along its direction of travel.
        const px = s.x - s.vx * 0.022;
        const py = s.y - s.vy * 0.022;
        const k = Math.max(0, s.life / s.max);
        // Hot sparks run white -> amber -> orange as they cool.
        const light = 58 + 40 * k;
        ctx.strokeStyle = `hsla(${s.hue}, 100%, ${light}%, ${k})`;
        ctx.lineWidth = s.size * (0.5 + k);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      sparks = sparks.filter((s) => s.life > 0 && s.y < window.innerHeight + 20);

      ctx.globalCompositeOperation = "source-over";
      raf = sparks.length || flashes.length ? requestAnimationFrame(tick) : 0;
      if (!raf) {
        last = 0;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const burst = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const n = 44 + Math.floor(Math.random() * 18);
      for (let i = 0; i < n; i++) {
        // Mostly upward and outward, like spatter off the arc.
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
        const speed = 260 + Math.random() * 560;
        const max = 0.45 + Math.random() * 0.7;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: max,
          max,
          size: 1.3 + Math.random() * 1.9,
          hue: 28 + Math.random() * 22,
        });
      }
      flashes.push({ x: e.clientX, y: e.clientY, life: 0.22 });
      if (sparks.length > 400) sparks = sparks.slice(-400);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    document.addEventListener("pointerdown", burst, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", burst);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] h-full w-full" />;
}
