import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/content/types";

export function StatusBadge({ status, onPhoto = false }: { status: Project["status"]; onPhoto?: boolean }) {
  const done = status === "completed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[0.8rem] font-medium ${
        onPhoto ? "rounded-sm bg-ink/85 px-2 py-1 text-on-ink backdrop-blur" : done ? "text-ok" : "text-warn"
      }`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${done ? "bg-ok" : "bg-warn"}`} />
      {done ? "Completed" : "Ongoing"}
    </span>
  );
}

// Portfolio tile. With CMS photographs: the first photo, with a count of the
// rest. Without: a typed site board (code, title, place, sector) — never a
// stand-in photo, so every image on the site is of the company's own work or
// clearly decorative.
export default function ProjectCard({
  project,
  headingLevel = "h3",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
  index?: number;
}) {
  const H = headingLevel;
  const photo = project.images[0];
  const more = project.images.length - 1;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden border border-line bg-card transition-colors hover:border-line-strong">
      {photo ? (
        <div className="photo-zoom relative aspect-[4/3] overflow-hidden bg-ink">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          {more > 0 ? (
            <span className="absolute bottom-3 end-3 rounded-sm bg-ink/85 px-2 py-1 text-[0.8rem] text-on-ink backdrop-blur">
              +{more} photo{more > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          {project.code ? <p className="font-mono text-[0.8rem] text-steel">{project.code}</p> : <span />}
          <StatusBadge status={project.status} />
        </div>
        <H className={`mt-4 text-2xl leading-tight ${photo ? "" : "sm:text-[1.7rem]"}`}>
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-flame group-hover:decoration-2 group-hover:underline-offset-4">
            {project.title}
          </Link>
        </H>
        <p className="mt-auto pt-6 text-[0.95rem] text-steel-text">
          {project.location}
          {project.sector ? <span className="block text-steel">{project.sector}</span> : null}
        </p>
      </div>
    </article>
  );
}
