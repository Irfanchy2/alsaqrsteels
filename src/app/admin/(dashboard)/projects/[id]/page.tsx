import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import ProjectForm from "@/components/admin/ProjectForm";
import MediaUpload from "@/components/admin/MediaUpload";
import { addProjectImage, updateProjectImage } from "../../../actions";

export default async function EditProject({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStaff();
  const [{ data: project }, { data: services }, { data: images }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("services").select("slug, title").not("slug", "is", null).order("sort_order"),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageTitle title={project.title} back={{ href: "/admin/projects", label: "Projects" }}>
        {project.published && project.slug ? (
          <Link href={`/projects/${project.slug}`} target="_blank" className="btn btn-secondary btn-sm">
            View on site ↗
          </Link>
        ) : null}
      </PageTitle>
      <Flash saved={saved} error={error} />
      <div className="grid gap-10 2xl:grid-cols-2">
        <ProjectForm project={project} services={(services ?? []) as { slug: string; title: string }[]} />

        <section className="space-y-6">
          <h2 className="text-xl font-bold">Photographs</h2>
          <Card>
            <form action={addProjectImage} className="space-y-4">
              <input type="hidden" name="project_id" value={project.id} />
              <MediaUpload name="url" folder={`projects/${project.id}`} label="Choose photo" withSize />
              <div>
                <label htmlFor="alt-new" className="field-label">
                  Describe the photo <span className="text-accent">*</span>
                </label>
                <input id="alt-new" name="alt" className="input" placeholder="e.g. Pipe rack steel being erected at the compressor station" />
                <span className="field-hint">Used by screen readers and search engines. Describe what the photo shows.</span>
              </div>
              <button className="btn btn-primary btn-sm">Add photo</button>
            </form>
          </Card>
          {(images ?? []).length ? (
            <ul className="space-y-4">
              {(images ?? []).map((img) => (
                <li key={img.id}>
                  <Card>
                    <form action={updateProjectImage} className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                      <input type="hidden" name="project_id" value={project.id} />
                      <input type="hidden" name="id" value={img.id} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-24 w-32 border border-line object-cover" />
                      <div className="space-y-3">
                        <input name="alt" defaultValue={img.alt} className="input !min-h-10 !py-2" aria-label="Photo description" />
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            Order
                            <input name="sort_order" type="number" defaultValue={img.sort_order} className="input !min-h-9 !w-20 !py-1" />
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="delete" className="h-4 w-4" /> Remove
                          </label>
                          <button className="btn btn-secondary btn-sm">Save</button>
                        </div>
                      </div>
                    </form>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-steel-text">No photographs yet. The public page shows a “photographs being prepared” note until you add one.</p>
          )}
        </section>
      </div>
    </>
  );
}
