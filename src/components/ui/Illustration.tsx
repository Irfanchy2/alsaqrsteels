import type { IllustrationKey } from "@/lib/content/types";

// Line drawings in the style of a fabrication drawing. Used where a genuine
// photograph is not yet available — they illustrate the kind of work, and are
// never presented as photographs of a project.

type Props = {
  name: IllustrationKey;
  className?: string;
  title?: string;
};

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" as const };
const THIN = { fill: "none", stroke: "currentColor", strokeWidth: 1, opacity: 0.55 };
const DIM = { fill: "none", stroke: "var(--color-accent)", strokeWidth: 1.25 };
const CENTER = { ...THIN, strokeDasharray: "10 4 2 4" };

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...DIM} markerStart="url(#ill-ah)" markerEnd="url(#ill-ah)" />
    </g>
  );
}

export function IllustrationDefs() {
  // Rendered once per page (in the site layout) so ids are unique.
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <DefsInner />
    </svg>
  );
}

function DefsInner() {
  return (
    <defs>
      <marker id="ill-ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" fill="var(--color-accent)" />
      </marker>
      <pattern id="ill-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      </pattern>
    </defs>
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fontFamily="var(--font-mono)" fontSize="11" fill="var(--color-accent)" letterSpacing="1">
      {children}
    </text>
  );
}

function IBeam() {
  // I-section, with its elevation as a beam on two columns.
  return (
    <g>
      {/* section */}
      <path d="M70 60 h120 v16 h-52 v128 h52 v16 h-120 v-16 h52 v-128 h-52 z" {...S} />
      <path d="M70 60 h120 v16 h-52 v128 h52 v16 h-120 v-16 h52 v-128 h-52 z" fill="url(#ill-hatch)" />
      <line x1="130" y1="44" x2="130" y2="236" {...CENTER} />
      <line x1="56" y1="140" x2="204" y2="140" {...CENTER} />
      <Arrow x1={52} y1={60} x2={52} y2={220} />
      <Label x={24} y={145}>H</Label>
      <Arrow x1={70} y1={246} x2={190} y2={246} />
      <Label x={126} y={264}>B</Label>
      {/* elevation */}
      <rect x="236" y="92" width="140" height="18" {...S} />
      <line x1="236" y1="101" x2="376" y2="101" {...THIN} />
      <rect x="244" y="110" width="12" height="118" {...S} />
      <rect x="356" y="110" width="12" height="118" {...S} />
      <line x1="226" y1="228" x2="386" y2="228" {...S} />
      <path d="M256 128 l20 -18 M356 128 l-20 -18" {...THIN} />
      <Label x={284} y={84}>BEAM</Label>
    </g>
  );
}

function Pipe() {
  return (
    <g>
      {/* pipe run with a butt weld and a flange */}
      <rect x="40" y="96" width="140" height="56" {...S} />
      <rect x="186" y="96" width="140" height="56" {...S} />
      <path d="M180 96 q3 28 0 56 M186 96 q-3 28 0 56" {...S} strokeWidth={1.5} />
      <path d="M180 96 h6 v56 h-6" fill="var(--color-accent)" opacity="0.25" />
      <rect x="326" y="84" width="14" height="80" {...S} />
      <rect x="340" y="84" width="14" height="80" {...S} />
      <line x1="30" y1="124" x2="370" y2="124" {...CENTER} />
      <Label x={166} y={84}>BW</Label>
      <line x1="183" y1="88" x2="183" y2="96" {...DIM} />
      {/* shoe and support */}
      <path d="M92 152 h40 v12 h-40 z" {...S} />
      <path d="M84 164 h56 v10 h-56 z" {...S} />
      <path d="M96 174 v58 M128 174 v58" {...S} />
      <path d="M84 232 h56" {...S} />
      <path d="M96 196 l32 20 M128 196 l-32 20" {...THIN} />
      {/* clamp */}
      <path d="M246 88 q24 -14 48 0 M246 160 q24 14 48 0" {...S} strokeWidth={1.5} />
      <line x1="252" y1="170" x2="252" y2="232" {...S} />
      <line x1="288" y1="170" x2="288" y2="232" {...S} />
      <line x1="240" y1="232" x2="300" y2="232" {...S} />
      <Arrow x1={40} y1={252} x2={326} y2={252} />
    </g>
  );
}

function Cnc() {
  return (
    <g>
      {/* plate */}
      <rect x="40" y="70" width="320" height="180" {...S} fill="url(#ill-hatch)" />
      {/* cut profile: gusset / base plate with holes */}
      <path d="M90 110 h150 l60 60 v50 h-210 z" {...S} strokeWidth={2.5} fill="var(--color-card)" />
      <circle cx="120" cy="140" r="11" {...S} />
      <circle cx="120" cy="195" r="11" {...S} />
      <circle cx="210" cy="140" r="11" {...S} />
      <circle cx="265" cy="195" r="11" {...S} />
      <line x1="100" y1="140" x2="140" y2="140" {...THIN} />
      <line x1="120" y1="120" x2="120" y2="160" {...THIN} />
      {/* torch path */}
      <path d="M300 170 l40 -60" {...DIM} strokeDasharray="4 4" />
      <path d="M332 50 h24 l-6 40 h-12 z" {...S} />
      <line x1="344" y1="90" x2="344" y2="104" stroke="var(--color-accent)" strokeWidth="3" />
      <circle cx="344" cy="108" r="4" fill="var(--color-accent)" />
      <Label x={48} y={62}>PLATE</Label>
      <Arrow x1={90} y1={270} x2={300} y2={270} />
    </g>
  );
}

function Tank() {
  return (
    <g>
      {/* skid frame */}
      <rect x="92" y="40" width="216" height="200" {...S} />
      <line x1="92" y1="40" x2="308" y2="240" {...THIN} />
      <line x1="308" y1="40" x2="92" y2="240" {...THIN} />
      <rect x="80" y="240" width="240" height="14" {...S} />
      {/* vessel */}
      <path d="M140 72 q60 -26 120 0 v150 h-120 z" {...S} fill="var(--color-card)" strokeWidth={2.5} />
      <line x1="140" y1="112" x2="260" y2="112" {...THIN} />
      <line x1="140" y1="182" x2="260" y2="182" {...THIN} />
      <line x1="200" y1="30" x2="200" y2="262" {...CENTER} />
      {/* nozzles */}
      <path d="M260 150 h22 M282 140 v20" {...S} />
      <path d="M186 58 v-14 h28 v14" {...S} />
      {/* ladder */}
      <path d="M320 70 v170 M338 70 v170" {...S} strokeWidth={1.5} />
      {[86, 110, 134, 158, 182, 206, 230].map((y) => (
        <line key={y} x1="320" y1={y} x2="338" y2={y} {...S} strokeWidth={1.5} />
      ))}
      <Arrow x1={60} y1={72} x2={60} y2={222} />
      <Label x={30} y={150}>H</Label>
    </g>
  );
}

function Rail() {
  return (
    <g>
      {/* stair stringer and handrail */}
      <path d="M40 250 L300 90" {...S} />
      <path d="M40 250 h30 v-18 h30 v-18 h30 v-18 h30 v-18 h30 v-18 h30 v-18 h30 v-18 h30 v-18" {...S} strokeWidth={1.5} />
      <path d="M52 170 L312 10" {...S} strokeWidth={3} />
      {[70, 130, 190, 250].map((x, i) => (
        <line key={x} x1={x} y1={232 - i * 36} x2={x} y2={152 - i * 36} {...S} />
      ))}
      <path d="M58 202 L318 42" {...THIN} />
      {/* platform grating */}
      <rect x="300" y="90" width="80" height="14" {...S} fill="url(#ill-hatch)" />
      <line x1="376" y1="90" x2="376" y2="250" {...S} />
      <line x1="300" y1="104" x2="300" y2="250" {...S} />
      <path d="M300 104 L376 250 M376 104 L300 250" {...THIN} />
      <Label x={316} y={80}>PLATFORM</Label>
      <Arrow x1={40} y1={270} x2={300} y2={270} />
    </g>
  );
}

function Gate() {
  // Sliding/boundary gate elevation with vertical pickets and a frame.
  return (
    <g>
      <rect x="40" y="70" width="320" height="150" {...S} />
      <line x1="40" y1="100" x2="360" y2="100" {...S} />
      <line x1="40" y1="190" x2="360" y2="190" {...S} />
      {Array.from({ length: 11 }, (_, i) => 66 + i * 28).map((x) => (
        <line key={x} x1={x} y1="100" x2={x} y2="190" {...THIN} />
      ))}
      <line x1="40" y1="230" x2="360" y2="230" {...S} />
      <circle cx="70" cy="230" r="8" {...THIN} />
      <circle cx="330" cy="230" r="8" {...THIN} />
      <Label x={150} y={58}>BOUNDARY GATE</Label>
      <Arrow x1={40} y1={250} x2={360} y2={250} />
    </g>
  );
}

function Stair() {
  // Steel staircase stringer with treads and a handrail.
  return (
    <g>
      <path d="M60 230 L300 230 L300 70" {...THIN} />
      <path d="M60 230 L120 230 L120 198 L172 198 L172 166 L224 166 L224 134 L276 134 L276 102 L300 102" {...S} />
      <path d="M60 212 L120 212 L120 180 L172 180 L172 148 L224 148 L224 116 L276 116 L276 84" {...S} />
      <line x1="96" y1="206" x2="96" y2="70" {...THIN} />
      <path d="M96 70 L300 70" {...S} />
      <path d="M96 90 L300 90" {...THIN} />
      {[120, 172, 224, 276].map((x, i) => (
        <line key={x} x1={x} y1={198 - i * 32} x2={x} y2={120 - i * 32} {...THIN} />
      ))}
      <Label x={190} y={56}>HANDRAIL</Label>
      <Arrow x1={60} y1={252} x2={300} y2={252} />
    </g>
  );
}

function Canopy() {
  // Parking / roof canopy: columns carrying a shallow-pitch roof.
  return (
    <g>
      <path d="M40 110 L360 80 L360 100 L40 130 z" {...S} />
      <line x1="40" y1="120" x2="360" y2="90" {...THIN} />
      <line x1="80" y1="124" x2="80" y2="240" {...S} />
      <line x1="320" y1="95" x2="320" y2="240" {...S} />
      <line x1="200" y1="110" x2="200" y2="240" {...THIN} />
      <path d="M80 150 L200 138 M200 138 L80 170 M320 122 L200 138 M200 138 L320 150" {...THIN} />
      <line x1="60" y1="240" x2="100" y2="240" {...S} />
      <line x1="300" y1="240" x2="340" y2="240" {...S} />
      <Label x={150} y={66}>ROOF CANOPY</Label>
      <Arrow x1={80} y1={262} x2={320} y2={262} />
    </g>
  );
}

const MAP: Record<IllustrationKey, () => React.ReactElement> = {
  ibeam: IBeam,
  pipe: Pipe,
  cnc: Cnc,
  tank: Tank,
  rail: Rail,
  gate: Gate,
  stair: Stair,
  canopy: Canopy,
};

export default function Illustration({ name, className, title }: Props) {
  const Drawing = MAP[name] ?? IBeam;
  return (
    <svg
      viewBox="0 0 400 290"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <Drawing />
    </svg>
  );
}
