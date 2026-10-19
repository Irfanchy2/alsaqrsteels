import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { PageTitle } from "@/components/admin/AdminUI";

export default async function AdminServices() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("services").select("slug, number, title, summary, published, image_url").not("slug", "is", null).order("sort_order");
  return (
    <>
      <PageTitle title="Services" />
      <ul className="divide-y divide-line border border-line bg-card">
        {(data ?? []).map((s) => (
          <li key={s.slug} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-mono text-xs text-accent">{s.number}</p>
              <Link href={`/admin/services/${s.slug}`} className="text-lg font-semibold underline">
                {s.title}
              </Link>
              <p className="mt-1 max-w-2xl text-sm text-steel-text">{s.summary}</p>
            </div>
            <p className="text-sm text-steel-text">
              {s.published ? "Published" : "Hidden"} · {s.image_url ? "Photo set" : "Illustration only"}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-steel-text">
        New service categories (for example gates, railings or staircases) need a new page design decision — ask your web
        developer to add one, then edit it here.
      </p>
    </>
  );
}
