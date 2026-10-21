import type { ReactNode } from "react";
import { getLayout, getServices, getProjects } from "@/lib/content";
import { resolveLayout, type Block } from "@/lib/content/blocks";
import { servicePhoto } from "@/lib/content/stock";
import BlockView, { type BlockData } from "./BlockView";

// Renders a page from its saved block layout (Admin → Page builder). Built-in
// sections come from the page itself as ready-made nodes; free blocks are
// drawn by BlockView. With no saved layout, the page shows its sections in
// their original order, so the site looks exactly as before.
export default async function PageLayout({
  page,
  sections = {},
  blocks: given,
}: {
  page: string;
  sections?: Record<string, ReactNode>;
  blocks?: Block[];
}) {
  const blocks = given ?? resolveLayout(page, await getLayout(page));
  const visible = blocks.filter((b) => !b.hidden);
  const needs = new Set(visible.map((b) => b.type));
  const data = needs.has("servicesGrid") || needs.has("projectsGrid") || needs.has("quickQuote") ? await loadData() : undefined;

  return (
    <>
      {visible.map((b) =>
        b.type === "section" ? (
          <SectionSlot key={b.id}>{sections[String(b.props.key)] ?? null}</SectionSlot>
        ) : (
          <BlockView key={b.id} block={b} data={data} />
        )
      )}
    </>
  );
}

function SectionSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

async function loadData(): Promise<BlockData> {
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  return {
    services: services.map((s, i) => ({ slug: s.slug, title: s.title, summary: s.summary, photo: servicePhoto(s, i).src })),
    projects: ordered,
  };
}
