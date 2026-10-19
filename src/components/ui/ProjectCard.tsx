import Link from "next/link";
import Image from "next/image";
import type { Project, IllustrationKey } from "@/lib/content/types";
import Illustration from "./Illustration";

export function StatusBadge({ status, onPhoto = false }: { status: Project["status"]; onPhoto?: boolean }) {
  const done = status === "completed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] ${
        onPhoto ? "bg-ink/85 px-2 py-1 text-on-ink backdrop-blur" : done ? "text-ok" : "text-warn"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${done ? (onPhoto ? "bg-[#3ddc84]" : "bg-ok") : onPhoto ? "bg-amber" : "bg-warn"}`}
      />
      {done ? "Completed" : "Ongoing"}
    </span>
  );
}


const SECTOR_DRAWING: Record<string, IllustrationKey> = {
  "Oil & gas": "pipe",
  Infrastructure: "rail",
  Industrial: "tank",
  "Residential & commercial": "ibeam",
};

// Portfolio tile: the project's own first photograph under a dark gradient,
// or — until photos are uploaded in the CMS — a line drawing of the sector on
// the construction grid. Never a stand-in photo of someone else's work.
export default function ProjectCard({
  project,
  headingLevel = "h3",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
  /** Accepted for call-site compatibility; no longer used. */
  index?: number;
}) {
  const H = headingLevel;
  const photo = project.images[0];
  const more = project.images.length - 1;
  const code = project.code?.replace(/-/, " / ");
  return (
    <article data-tilt className="edge-draw group relative flex aspect-[4/3.4] h-full w-full min-w-0 min-h-[17rem] border border-line-ink flex-col justify-end overflow-hidden bg-ink-2 text-on-ink">
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <div className="yard-grid absolute inset-0 flex items-center justify-center text-on-ink-muted" aria-hidden="true">
          <Illustration
            name={SECTOR_DRAWING[project.sector] ?? "ibeam"}
            className="h-[60%] w-[60%] -translate-y-8 opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/5" />

      <div className="absolute start-3 top-3">
        <StatusBadge status={project.status} onPhoto />
      </div>
      {more > 0 ? (
        <span className="absolute end-3 top-3 bg-ink/80 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-on-ink backdrop-blur">
          +{more} photo{more > 1 ? "s" : ""}
        </span>
      ) : null}

      <div className="relative p-5">
        {code ? <p className="font-mono text-xs tracking-[0.12em] text-amber">{code}</p> : null}
        <H className="mt-1.5 text-xl uppercase leading-none [font-stretch:78%] sm:text-[1.4rem]">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 group-hover:text-flame">
            {project.title}
          </Link>
        </H>
        <p className="mt-2 text-[0.82rem] text-on-ink-muted">
          {project.location}
          {project.sector ? <> · {project.sector}</> : null}
        </p>
        <p className="mt-3 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-on-ink-muted transition-colors group-hover:text-amber">
          View project <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      </div>
    </article>
  );
}
