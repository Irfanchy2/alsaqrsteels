import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { BUILT_IN, resolveLayout, type CustomPage, type Layout } from "@/lib/content/blocks";
import { PAGES } from "@/lib/content/pages";
import { getServices, getProjects } from "@/lib/content";
import { servicePhoto } from "@/lib/content/stock";
import Builder from "@/components/admin/builder/Builder";

const PATHS: Record<string, string> = { home: "/", services: "/services", projects: "/projects", about: "/about", quality: "/quality", contact: "/contact" };

export default async function BuilderPage({ params }: { params: Promise<{ page: string }> }) {
  const pageKey = decodeURIComponent((await params).page);
  const { supabase } = await requireStaff();
  const custom = pageKey.startsWith("c:");
  let label = "";
  let path = "";
  if (custom) {
    const { data } = await supabase.from("site_content").select("data").eq("key", "pages:custom").maybeSingle();
    const page = ((data?.data as CustomPage[] | undefined) ?? []).find((p) => `c:${p.slug}` === pageKey);
    if (!page) notFound();
    label = page.title;
    path = `/${page.slug}`;
  } else {
    if (!BUILT_IN[pageKey]) notFound();
    label = `${PAGES.find((p) => p.key === pageKey)?.label ?? pageKey} page`;
    path = PATHS[pageKey];
  }

  const [{ data: saved }, services, projects] = await Promise.all([
    supabase.from("site_content").select("data").eq("key", `layout:${pageKey}`).maybeSingle(),
    getServices(),
    getProjects(),
  ]);
  const layout = (saved?.data as Layout | undefined) ?? null;
  const blocks = custom ? (layout?.blocks ?? []) : resolveLayout(pageKey, layout);
  const sectionLabels = Object.fromEntries((BUILT_IN[pageKey] ?? []).map((s) => [s.key, s.label]));
  const editableSections = PAGES.find((p) => p.key === pageKey)?.sections.map((s) => s.key) ?? [];

  return (
    <Builder
      pageKey={pageKey}
      pageLabel={label}
      pagePath={path}
      initial={blocks}
      sectionLabels={sectionLabels}
      editableSections={editableSections}
      data={{
        services: services.map((s, i) => ({ slug: s.slug, title: s.title, summary: s.summary, photo: servicePhoto(s, i).src })),
        projects,
      }}
    />
  );
}
