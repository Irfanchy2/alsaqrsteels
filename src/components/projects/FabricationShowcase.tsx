import Link from "next/link";
import Image from "next/image";
import { SHOWCASE_PHOTO } from "@/lib/content/stock";
import type { IllustrationKey } from "@/lib/content/types";
import Illustration from "@/components/ui/Illustration";
import ConceptDrawing, { type ConceptKey } from "@/components/ui/ConceptDrawing";

// Things the workshop fabricates to order: a photograph of each kind of item,
// with its line drawing traced over the photo on hover, like a shop drawing
// laid over the finished piece.
const ITEMS: { title: string; blurb: string; drawing: IllustrationKey | ConceptKey; photo: string; service: string }[] = [
  { title: "Steel Staircases", photo: "stair", blurb: "Straight and wrap stringer stairs with treads and handrails, fabricated to your drawings.", drawing: "stair", service: "steel-structures" },
  { title: "Ladders & Staircases", photo: "ladder", blurb: "Fixed access ladders with safety cages, and service stairs for plant and rooftops.", drawing: "ladder", service: "steel-structures" },
  { title: "Parking Sheds", photo: "shed", blurb: "Column-and-rafter car parking sheds with bracing, sized to the bay layout.", drawing: "shed", service: "steel-structures" },
  { title: "Car Parking & Sun Shades", photo: "sunshade", blurb: "Shade structures for parking and outdoor areas, ready for your chosen cladding.", drawing: "canopy", service: "steel-structures" },
  { title: "Steel Canopies", photo: "canopy", blurb: "Entrance and walkway canopies on welded steel frames.", drawing: "canopy", service: "steel-structures" },
  { title: "Pergolas", photo: "pergola", blurb: "Steel pergola frames for gardens, terraces and commercial outdoor spaces.", drawing: "pergola", service: "steel-structures" },
  { title: "Steel Gates", photo: "gate", blurb: "Swing and sliding boundary gates with framed pickets.", drawing: "gate", service: "steel-structures" },
  { title: "Fences", photo: "fence", blurb: "Boundary and security fencing with posts, rails and pickets.", drawing: "fence", service: "steel-structures" },
];

const NEW: string[] = ["pergola", "fence", "shed", "ladder"];
const DRAW = "h-[78%] w-[78%] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-90 group-focus-within:opacity-90";

export default function FabricationShowcase() {
  return (
    <section aria-labelledby="showcase-title" className="on-ink bg-ink py-16 lg:py-24">
      <div className="wrap">
        <p className="label">Made to order</p>
        <h2 id="showcase-title" className="mt-4 text-4xl uppercase sm:text-5xl">
          Fabrication showcase
        </h2>
        <p className="mt-4 max-w-[62ch] text-on-ink-muted">
          Typical items we fabricate and install to your drawings. Hover a photo to see its shop drawing, then
          request a quotation for your own design.
        </p>
        <ul className="mt-10 grid gap-px bg-ink-2 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {ITEMS.map((it) => (
            <li key={it.title} data-reveal="photo" className="tile group relative flex flex-col bg-ink p-5">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
                <Image
                  src={SHOWCASE_PHOTO[it.photo].src}
                  alt={SHOWCASE_PHOTO[it.photo].alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-[0.35]"
                />
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  {NEW.includes(it.drawing) ? (
                    <ConceptDrawing name={it.drawing as ConceptKey} className={DRAW} />
                  ) : (
                    <Illustration name={it.drawing as IllustrationKey} className={DRAW} />
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-xl uppercase [font-stretch:78%]">{it.title}</h3>
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
