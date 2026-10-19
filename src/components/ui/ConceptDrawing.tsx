// Extra concept line drawings (pergola, fence, parking shed, ladder). Kept in
// their own file; same drawing style as ./Illustration. Never photographs.
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" as const };
const THIN = { fill: "none", stroke: "currentColor", strokeWidth: 1, opacity: 0.55 };
const DIM = { fill: "none", stroke: "var(--color-accent)", strokeWidth: 1.25 };

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} {...DIM} markerStart="url(#ill-ah)" markerEnd="url(#ill-ah)" />;
}
function Label({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fontFamily="var(--font-mono)" fontSize="11" fill="var(--color-accent)" letterSpacing="1">
      {children}
    </text>
  );
}

function Pergola() {
  // Steel pergola: four posts, beams and closely spaced rafters.
  return (
    <g>
      <line x1="70" y1="110" x2="70" y2="240" {...S} />
      <line x1="330" y1="110" x2="330" y2="240" {...S} />
      <line x1="120" y1="90" x2="120" y2="225" {...THIN} />
      <line x1="280" y1="90" x2="280" y2="225" {...THIN} />
      <path d="M60 110 L340 110 M110 90 L290 90" {...S} />
      {Array.from({ length: 13 }, (_, i) => 76 + i * 20).map((x) => (
        <line key={x} x1={x} y1="100" x2={x + 8} y2="82" {...THIN} />
      ))}
      <line x1="55" y1="240" x2="345" y2="240" {...S} />
      <Label x={160} y={66}>STEEL PERGOLA</Label>
      <Arrow x1={70} y1={262} x2={330} y2={262} />
    </g>
  );
}

function Fence() {
  // Boundary fence: posts with top and bottom rails and vertical pickets.
  return (
    <g>
      {[50, 200, 350].map((x) => (
        <rect key={x} x={x - 5} y="90" width="10" height="150" {...S} />
      ))}
      <line x1="55" y1="115" x2="345" y2="115" {...S} />
      <line x1="55" y1="215" x2="345" y2="215" {...S} />
      {Array.from({ length: 20 }, (_, i) => 70 + i * 14.5).map((x) => (
        <line key={x} x1={x} y1="100" x2={x} y2="215" {...THIN} />
      ))}
      <line x1="30" y1="240" x2="370" y2="240" {...S} />
      <Label x={150} y={76}>BOUNDARY FENCE</Label>
      <Arrow x1={50} y1={262} x2={350} y2={262} />
    </g>
  );
}

function Shed() {
  // Car-parking shed: mono-pitch roof on columns with bracing and bays.
  return (
    <g>
      <path d="M30 120 L370 84 L370 98 L30 134 z" {...S} />
      {[60, 150, 240, 330].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={130 - i * 10} x2={x} y2="240" {...S} />
          <path d={`M${x} ${160 - i * 10} L${x + 28} ${130 - i * 10}`} {...THIN} />
        </g>
      ))}
      <rect x="85" y="214" width="46" height="20" rx="4" {...THIN} />
      <rect x="175" y="214" width="46" height="20" rx="4" {...THIN} />
      <rect x="265" y="214" width="46" height="20" rx="4" {...THIN} />
      <line x1="30" y1="240" x2="370" y2="240" {...S} />
      <Label x={130} y={70}>PARKING SHED</Label>
      <Arrow x1={60} y1={262} x2={330} y2={262} />
    </g>
  );
}

function Ladder() {
  // Fixed access ladder with safety cage hoops.
  return (
    <g>
      <path d="M170 40 v200 M230 40 v200" {...S} />
      {Array.from({ length: 12 }, (_, i) => 56 + i * 16).map((y) => (
        <line key={y} x1="170" y1={y} x2="230" y2={y} {...THIN} />
      ))}
      {[110, 160, 210].map((y) => (
        <ellipse key={y} cx="200" cy={y} rx="46" ry="10" {...THIN} />
      ))}
      <path d="M154 40 h92" {...S} />
      <line x1="130" y1="240" x2="270" y2="240" {...S} />
      <Label x={250} y={60}>CAGED LADDER</Label>
      <Arrow x1={110} y1={40} x2={110} y2={240} />
    </g>
  );
}

export type ConceptKey = "pergola" | "fence" | "shed" | "ladder";
const MAP: Record<ConceptKey, () => React.ReactElement> = { pergola: Pergola, fence: Fence, shed: Shed, ladder: Ladder };

export default function ConceptDrawing({ name, className }: { name: ConceptKey; className?: string }) {
  const Drawing = MAP[name];
  return (
    <svg viewBox="0 0 400 290" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <Drawing />
    </svg>
  );
}
