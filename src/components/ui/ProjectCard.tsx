import Link from "next/link";
import Image from "next/image";
import type { Project, IllustrationKey } from "@/lib/content/types";
import { projectPhoto } from "@/lib/content/stock";

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


// Portfolio tile: the project's photograph (or a representative stock photo
// while project photographs are pending) under a dark gradient, with the
// project number in amber and the title set like a site board.
export default function ProjectCard({
  project,
  headingLevel = "h3",
  index = 0,
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
  index?: number;
}) {
  const H = headingLevel;
  const { image: photo, representative } = projectPhoto(project, index);
  const code = project.code?.replace(/-/, " / ");
  return (
    <article className="edge-draw group relative flex aspect-[4/3.4] h-full w-full min-w-0 min-h-[17rem] border border-line-ink flex-col justify-end overflow-hidden bg-ink-2 text-on-ink">
      <Image
        src={photo.src}
        alt={representative ? "" : photo.alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className={`object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06] ${representative ? "opacity-70 saturate-[0.85]" : ""}`}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/5" />

      <div className="absolute start-3 top-3">
        <StatusBadge status={project.status} onPhoto />
      </div>
      {representative ? (
        <span className="absolute end-3 top-3 bg-ink/70 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-on-ink-muted backdrop-blur">
          Representative image
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
