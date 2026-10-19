import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle, StatusPill } from "@/components/admin/AdminUI";

export default async function AdminBlog({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, updated_at")
    .order("published_at", { ascending: false, nullsFirst: true })
    .limit(300);
  const posts = data ?? [];
  const live = posts.filter((p) => p.status === "published").length;

  return (
    <>
      <PageTitle title="Blog posts">
        <Link href="/admin/blog/new" className="btn btn-primary btn-sm">
          + New post
        </Link>
      </PageTitle>
      <Flash saved={saved} error={error} />
      <p className="mb-6 text-sm text-steel-text">
        {live} published · {posts.length - live} drafts. Published posts appear on the website&rsquo;s Blog page within a few minutes.
      </p>
      <ul className="divide-y divide-line border border-line bg-card">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/blog/${p.id}`} className="flex flex-col gap-2 px-4 py-4 hover:bg-paper-2 sm:flex-row sm:items-center sm:gap-6">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">{p.title}</span>
                <span className="block truncate font-mono text-xs text-steel-text">/blog/{p.slug}</span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <StatusPill value={p.status === "published" ? "won" : "pending"} label={p.status === "published" ? "Live" : "Draft"} />
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-steel-text">
                  {p.status === "published"
                    ? p.published_at
                      ? new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "Published"
                    : "Draft"}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!posts.length ? <li className="px-4 py-6 text-steel-text">No posts yet.</li> : null}
      </ul>
    </>
  );
}
