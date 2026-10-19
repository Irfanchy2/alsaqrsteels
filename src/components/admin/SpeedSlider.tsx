"use client";

import { useState } from "react";

const LABELS: [number, string][] = [
  [0.5, "Very slow"],
  [0.75, "Slow"],
  [1, "Normal"],
  [1.25, "Brisk"],
  [1.5, "Fast"],
  [2, "Very fast"],
];

// Animation speed for the whole website, 0.5× to 2×, with a live preview bar.
export default function SpeedSlider({ defaultValue }: { defaultValue: number }) {
  const [v, setV] = useState(defaultValue);
  const label = LABELS.reduce((best, cur) => (Math.abs(cur[0] - v) < Math.abs(best[0] - v) ? cur : best))[1];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="speed" className="field-label !mb-0">
          Animation speed
        </label>
        <span className="font-mono text-sm tabular-nums">
          {v.toFixed(2)}× · {label}
        </span>
      </div>
      <input
        id="speed"
        name="speed"
        type="range"
        min={0.5}
        max={2}
        step={0.05}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--color-flame)]"
      />
      <div className="mt-1 flex justify-between text-xs text-steel-text">
        <span>Slower</span>
        <span>Faster</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
        <span className="block h-full w-1/4 rounded-full bg-flame" style={{ animation: `speed-preview ${2.4 / v}s ease-in-out infinite alternate` }} />
      </div>
      <p className="mt-2 text-xs text-steel-text">The bar above moves at the chosen speed.</p>
      <style>{`@keyframes speed-preview{from{transform:translateX(0)}to{transform:translateX(300%)}}`}</style>
    </div>
  );
}
