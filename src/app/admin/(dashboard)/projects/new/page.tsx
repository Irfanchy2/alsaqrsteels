import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProject({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data: services } = await supabase.from("services").select("slug, title").not("slug", "is", null).order("sort_order");
  return (
    <>
      <PageTitle title="Add project" back={{ href: "/admin/projects", label: "Projects" }} />
      <Flash error={error} />
      <ProjectForm services={(services ?? []) as { slug: string; title: string }[]} />
    </>
  );
}
