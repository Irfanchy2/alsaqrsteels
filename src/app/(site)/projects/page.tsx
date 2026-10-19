import type { Metadata } from "next";
import { getCompany, getProjects, getServices } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";
import ProjectExplorer from "@/components/projects/ProjectExplorer";
import FabricationShowcase from "@/components/projects/FabricationShowcase";
import EnquiryCta from "@/components/site/EnquiryCta";
import { STOCK } from "@/lib/content/stock";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Structural steel fabrication and erection by Al Saqr Al Ahmar on projects in Abu Dhabi, Dubai and Fujairah.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [company, projects, services] = await Promise.all([getCompany(), getProjects(), getServices()]);
  const serviceNames = Object.fromEntries(services.map((s) => [s.slug, s.title]));
  return (
    <>
      <PageHero
        image={STOCK.steelRoofFrame}
        crumbs={[{ name: "Projects", href: "/projects" }]}
        label="Projects"
        title="Project portfolio"
        lede="Projects where Al Saqr Al Ahmar carried out structural steel fabrication and erection. Each entry states our contribution and its current status."
      />
      <section aria-label="Projects" className="py-12 lg:py-16">
        <div className="wrap">
          <ProjectExplorer projects={projects} serviceNames={serviceNames} />
        </div>
      </section>
      <FabricationShowcase />
      <EnquiryCta company={company} title="Planning something similar?" quoteLabel="Discuss a Similar Project" />
    </>
  );
}
