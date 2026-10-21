import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompany, getProjects, getProject, getServices } from "@/lib/content";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Illustration from "@/components/ui/Illustration";
import ProjectCard, { StatusBadge } from "@/components/ui/ProjectCard";
import Gallery from "@/components/projects/Gallery";
import EnquiryCta from "@/components/site/EnquiryCta";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return {
    title: `${p.title} — ${p.scope}`,
    description: `${p.description} ${p.location}.`,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: p.images[0] ? { images: [{ url: p.images[0].src, alt: p.images[0].alt }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, projects, services, company] = await Promise.all([
    getProject(slug),
    getProjects(),
    getServices(),
    getCompany(),
  ]);
  if (!project) notFound();
  const projectServices = services.filter((s) => project.services.includes(s.slug));
  const more = projects.filter((p) => p.slug !== project.slug && p.sector === project.sector).concat(
    projects.filter((p) => p.slug !== project.slug && p.sector !== project.sector)
  );

  const facts: [string, React.ReactNode][] = [
    ["Project no.", project.code],
    ["Location", project.location],
    ["Sector", project.sector],
    ["Our scope", project.scope],
    ["Status", <StatusBadge key="s" status={project.status} onPhoto />],
  ];
  if (project.clientName) facts.splice(2, 0, ["Client", project.clientName]);
  if (project.year) facts.push(["Year", project.year]);

  const heroPhoto = project.images[0] ?? null;

  return (
    <>
      <section className="on-ink grain relative -mt-[5.5rem] lg:-mt-[6.25rem] overflow-hidden pt-[5.5rem] lg:pt-[6.25rem]">
        <div className="absolute inset-x-0 -top-[14%] -bottom-[14%]" data-parallax="0.3" aria-hidden="true">
          {heroPhoto ? <Image src={heroPhoto.src} alt="" fill priority sizes="(max-width: 768px) 70vw, 100vw" quality={50} className="kenburns object-cover opacity-40" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
          <div className="forge-glow absolute inset-0" />
        </div>
        <div className="wrap relative pb-14 pt-10 lg:pb-20 lg:pt-14">
          <Breadcrumbs onInk items={[{ name: "Projects", href: "/projects" }, { name: project.title, href: `/projects/${project.slug}` }]} />
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="label fade-up">{project.code?.replace(/-/, " / ")}</p>
              <h1 className="mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.2rem]">
                <span className="line-mask">
                  <span style={{ ["--d" as string]: "120ms" }}>{project.title}</span>
                </span>
              </h1>
              <p className="fade-up mt-6 max-w-[58ch] text-lg text-on-ink-muted sm:text-xl" style={{ ["--d" as string]: "260ms" }}>
                {project.description}
              </p>
            </div>
            {/* Drawing title block */}
            <dl className="fade-up self-end border border-line-ink border-t-4 border-t-flame bg-ink-2/90 backdrop-blur lg:col-span-5" style={{ ["--d" as string]: "380ms" }}>
              {facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8.5rem_1fr] border-b border-line-ink last:border-b-0">
                  <dt className="border-e border-line-ink px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-amber">
                    {k}
                  </dt>
                  <dd className="px-4 py-3 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="spark-rule relative" aria-hidden="true" />
      </section>

      <section aria-labelledby="photos-title" className="py-14 lg:py-20">
        <div className="wrap">
          <h2 id="photos-title" className="text-4xl">
            Photographs
          </h2>
          <div className="mt-8">
            {project.images.length ? (
              <Gallery images={project.images} title={project.title} />
            ) : (
              <div className="on-ink yard-grid grid gap-8 border-t-4 border-flame p-8 sm:grid-cols-[1fr_1.2fr] sm:items-center lg:p-12">
                <Illustration name="ibeam" className="mx-auto h-48 w-full max-w-sm text-on-ink-muted opacity-60" />
                <div>
                  <p className="text-xl font-semibold">Site photographs for this project are being prepared.</p>
                  <p className="mt-3 max-w-[50ch] text-steel-text">
                    We only publish photographs of our own work. If you need references for this project, ask our team
                    when you request a quote.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {projectServices.length ? (
        <section aria-labelledby="svc-title" className="border-t border-line bg-card py-14">
          <div className="wrap">
            <h2 id="svc-title" className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">
              Related services
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {projectServices.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="btn btn-secondary btn-sm">
                    <span className="font-mono text-xs text-accent">{s.number}</span> {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <EnquiryCta
        company={company}
        title="Discuss a similar project"
        text={`Planning work like ${project.title}? Send your drawings and scope, and our team will review them and contact you.`}
        quoteHref={`/quote?service=${project.services[0] ?? ""}`}
        quoteLabel="Discuss a Similar Project"
        whatsappMessage={`Hello Al Saqr Al Ahmar, I saw ${project.title} on your website and would like to discuss a similar project.`}
      />

      {more.length ? (
        <section aria-labelledby="more-title" className="py-16 lg:py-20">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="more-title" className="text-3xl font-bold">
                More projects
              </h2>
              <Link href="/projects" className="link-arrow">
                All projects <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul data-stagger className="mt-8 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {more.slice(0, 3).map((p, i) => (
                <li key={p.slug}>
                  <ProjectCard project={p} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
