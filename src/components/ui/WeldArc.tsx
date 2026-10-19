// Decorative welding arc: a flickering glow with sparks thrown downward.
// Pure CSS (see .weld in globals.css); static and hidden from assistive tech.
const SPARKS = [
  [150, 70, 0], [165, 110, 0.12], [180, 95, 0.3], [195, 120, 0.45], [210, 80, 0.2],
  [140, 60, 0.55], [220, 100, 0.66], [172, 130, 0.78], [200, 65, 0.9], [158, 90, 0.38],
  [188, 140, 0.05], [230, 70, 0.5], [130, 85, 0.84], [205, 115, 0.24],
] as const;

export default function WeldArc({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`weld ${className}`}>
      <span className="weld__glow" />
      {SPARKS.map(([a, dist, d], i) => (
        <span
          key={i}
          className="weld__spark"
          style={{ ["--a" as string]: `${a}deg`, ["--dist" as string]: `${dist}px`, ["--sd" as string]: `${d}s` }}
        />
      ))}
    </span>
  );
}
