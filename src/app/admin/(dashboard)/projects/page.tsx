import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";

export default async function AdminProjects({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("projects")
    .select("id, slug, code, title, location, status, published, featured, sort_order, project_images(count)")
    .not("slug", "is", null)
    .order("sort_order", { ascending: true });

  return (
    <>
      <PageTitle title="Projects & photos">
        <Link href="/admin/projects/new" className="btn btn-primary btn-sm">
          Add project
        </Link>
      </PageTitle>
      <Flash saved={saved} error={error} />
      <p className="mb-6 max-w-3xl text-sm text-steel-text">
        Publish only projects the company actually worked on, and only photographs of its own work. Client names stay
        hidden unless you tick “Client may be named” and hold written permission.
      </p>
      <div className="border border-line bg-card md:overflow-x-auto">
        <table className="rtable w-full text-sm md:min-w-[44rem]">
          <thead className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.1em] text-steel-text">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">On site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((p) => {
              const photos = (p.project_images as { count: number }[] | null)?.[0]?.count ?? 0;
              return (
                <tr key={p.id}>
                  <td data-label="No." className="px-4 py-3 font-mono">{p.code}</td>
                  <td data-label="Project" className="px-4 py-3">
                    <Link href={`/admin/projects/${p.id}`} className="font-medium underline">
                      {p.title}
                    </Link>
                    <p className="text-steel-text">{p.location}</p>
                  </td>
                  <td data-label="Status" className="px-4 py-3">{p.status}</td>
                  <td data-label="Photos" className={`px-4 py-3 ${photos ? "" : "text-warn"}`}>{photos || "None yet"}</td>
                  <td data-label="On site" className="px-4 py-3">
                    {p.published ? "Published" : "Hidden"}
                    {p.featured ? " · Featured" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
