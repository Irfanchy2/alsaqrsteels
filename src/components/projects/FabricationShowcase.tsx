import Link from "next/link";
import type { IllustrationKey } from "@/lib/content/types";
import Illustration from "@/components/ui/Illustration";
import ConceptDrawing, { type ConceptKey } from "@/components/ui/ConceptDrawing";

// Things the workshop fabricates to order. These are concept drawings — NOT
// completed client projects — and are labelled that way on every tile. Real
// project photographs are added through the admin panel as they become available.
const ITEMS: { title: string; blurb: string; drawing: IllustrationKey | ConceptKey; service: string }[] = [
  { title: "Steel Staircases", blurb: "Straight and wrap stringer stairs with treads and handrails, fabricated to your drawings.", drawing: "stair", service: "steel-structures" },
  { title: "Ladders & Staircases", blurb: "Fixed access ladders with safety cages, and service stairs for plant and rooftops.", drawing: "ladder", service: "steel-structures" },
  { title: "Parking Sheds", blurb: "Column-and-rafter car parking sheds with bracing, sized to the bay layout.", drawing: "shed", service: "steel-structures" },
  { title: "Car Parking & Sun Shades", blurb: "Shade structures for parking and outdoor areas, ready for your chosen cladding.", drawing: "canopy", service: "steel-structures" },
  { title: "Steel Canopies", blurb: "Entrance and walkway canopies on welded steel frames.", drawing: "canopy", service: "steel-structures" },
  { title: "Pergolas", blurb: "Steel pergola frames for gardens, terraces and commercial outdoor spaces.", drawing: "pergola", service: "steel-structures" },
  { title: "Steel Gates", blurb: "Swing and sliding boundary gates with framed pickets.", drawing: "gate", service: "steel-structures" },
  { title: "Fences", blurb: "Boundary and security fencing with posts, rails and pickets.", drawing: "fence", service: "steel-structures" },
];

const NEW: string[] = ["pergola", "fence", "shed", "ladder"];
const DRAW = "draw-in h-[88%] w-[88%] opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100";

export default function FabricationShowcase() {
  return (
    <section aria-labelledby="showcase-title" className="on-ink bg-ink py-16 lg:py-24">
      <div className="wrap">
        <p className="label">Made to order</p>
        <h2 id="showcase-title" className="mt-4 text-4xl uppercase sm:text-5xl">
          Fabrication showcase
        </h2>
        <p className="mt-4 max-w-[62ch] text-on-ink-muted">
          Typical items we fabricate and install. The drawings below are illustrative concepts, not photographs of
          completed client projects — request a quotation and we will price your own design.
        </p>
        <ul className="mt-10 grid gap-px bg-ink-2 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {ITEMS.map((it) => (
            <li key={it.title} className="tile group relative flex flex-col bg-ink p-5">
              <div className="yard-grid flex aspect-[4/3] items-center justify-center overflow-hidden text-on-ink-muted">
                {NEW.includes(it.drawing) ? (
                  <ConceptDrawing name={it.drawing as ConceptKey} className={DRAW} />
                ) : (
                  <Illustration name={it.drawing as IllustrationKey} className={DRAW} />
                )}
              </div>
              <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-amber">Concept drawing</p>
              <h3 className="mt-1 text-xl uppercase [font-stretch:78%]">{it.title}</h3>
              <p className="mt-2 text-sm text-on-ink-muted">{it.blurb}</p>
              <Link
                href={`/quote?service=${it.service}&topic=${encodeURIComponent(it.title)}`}
                className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-on-ink-muted after:absolute after:inset-0 group-hover:text-amber"
              >
                Request a quote <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
