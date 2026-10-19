import type { Metadata } from "next";
import { getPage, getCompany, getProjects, getServices } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import ProjectExplorer from "@/components/projects/ProjectExplorer";
import FabricationShowcase from "@/components/projects/FabricationShowcase";
import EnquiryCta from "@/components/site/EnquiryCta";
import { STOCK, photoRef } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Structural steel fabrication and erection by Al Saqr Al Ahmar on projects in Abu Dhabi, Dubai and Fujairah.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [company, projects, services] = await Promise.all([getCompany(), getProjects(), getServices()]);
  const pg = await getPage("projects");
  const serviceNames = Object.fromEntries(services.map((s) => [s.slug, s.title]));
  return (
    <>
      <PageHero
        image={pg.image("hero") ? photoRef(pg.image("hero")!) : STOCK.steelRoofFrame}
        crumbs={[{ name: "Projects", href: "/projects" }]}
        label={pg.text("hero", "label")}
        title={pg.text("hero", "title")}
        lede={pg.text("hero", "lede")}
      />
      <section aria-label="Projects" className="py-12 lg:py-16">
        <div className="wrap">
          <ProjectExplorer projects={projects} serviceNames={serviceNames} />
        </div>
      </section>
      {pg.visible("showcase") ? <FabricationShowcase title={pg.text("showcase", "title")} intro={pg.text("showcase", "intro")} /> : null}
      {pg.visible("cta") ? <EnquiryCta company={company} title={pg.text("cta", "title")} quoteLabel={pg.text("cta", "button")} /> : null}
    </>
  );
}
