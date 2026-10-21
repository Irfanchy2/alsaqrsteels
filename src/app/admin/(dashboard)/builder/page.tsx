import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import { BUILT_IN, type CustomPage } from "@/lib/content/blocks";
import { PAGES } from "@/lib/content/pages";
import Switch from "@/components/admin/Switch";
import { createCustomPage, deleteCustomPage, updateCustomPage } from "../../actions";

const PATHS: Record<string, string> = { home: "/", services: "/services", projects: "/projects", about: "/about", quality: "/quality", contact: "/contact" };

export default async function BuilderHome({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("site_content").select("key, data, updated_at").or("key.like.layout:%,key.eq.pages:custom");
  const rows = (data ?? []) as { key: string; data: unknown; updated_at: string }[];
  const custom = (rows.find((r) => r.key === "pages:custom")?.data as CustomPage[] | undefined) ?? [];
  const edited = new Map(rows.filter((r) => r.key.startsWith("layout:")).map((r) => [r.key.slice(7), r.updated_at]));

  return (
    <>
      <PageTitle title="Page builder" />
      <Flash saved={saved} error={error} />
      <p className="mb-8 max-w-2xl text-steel-text">
        Open a page to rearrange it by drag and drop, add new blocks (text, photos, galleries, cards, banners) and hide
        sections. To change the wording of the built-in sections, use <Link href="/admin/pages" className="underline">Page text</Link>.
      </p>

      <h2 className="mb-3 text-lg font-bold">Website pages</h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Object.keys(BUILT_IN).map((key) => (
          <li key={key}>
            <Link
              href={`/admin/builder/${key}`}
              className="group flex h-full flex-col rounded-lg border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-flame/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-bold">{PAGES.find((p) => p.key === key)?.label ?? key}</p>
                <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${edited.has(key) ? "bg-ok-bg text-ok" : "bg-paper-2 text-steel-text"}`}>
                  {edited.has(key) ? "Customised" : "Original"}
                </span>
              </div>
              <p className="font-mono text-xs text-steel-text">{PATHS[key]}</p>
              <p className="mt-auto pt-4 text-sm font-semibold text-accent group-hover:underline">Open in builder →</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-12 text-lg font-bold">Your own pages</h2>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {custom.length ? (
            custom.map((p) => (
              <Card key={p.slug} className="!p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <p className="font-bold">{p.title}</p>
                    <a href={`/${p.slug}`} target="_blank" className="font-mono text-xs text-steel-text underline">
                      /{p.slug} ↗
                    </a>
                  </div>
                  <Link href={`/admin/builder/c:${p.slug}`} className="btn btn-sm btn-primary">
                    Open in builder
                  </Link>
                </div>
                <details className="px-5 py-3">
                  <summary className="cursor-pointer text-sm text-steel-text">Page settings</summary>
                  <form action={updateCustomPage} className="mt-3 space-y-3">
                    <input type="hidden" name="slug" value={p.slug} />
                    <input name="title" defaultValue={p.title} className="input !min-h-10 !py-2" aria-label="Page name" />
                    <textarea name="description" defaultValue={p.description} rows={2} className="input" placeholder="Short description for Google (optional)" aria-label="Description" />
                    <Switch name="inMenu" defaultChecked={p.inMenu} label="Show in the top menu" />
                    <button className="btn btn-sm btn-secondary">Save settings</button>
                  </form>
                  <form action={deleteCustomPage} className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
                    <input type="hidden" name="slug" value={p.slug} />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="confirm" value="yes" className="h-4 w-4" /> Yes, delete this page
                    </label>
                    <button className="btn btn-sm text-danger hover:bg-danger-bg">Delete page</button>
                  </form>
                </details>
              </Card>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-line-strong p-8 text-center text-steel-text">
              No pages of your own yet. Create one on the right, for example “Steel Gates” or “Our Workshop”.
            </p>
          )}
        </div>
        <Card className="h-fit">
          <h3 className="text-lg font-bold">Add a page</h3>
          <form action={createCustomPage} className="mt-4 space-y-4">
            <div>
              <label htmlFor="pg-title" className="field-label">
                Page name
              </label>
              <input id="pg-title" name="title" required className="input" placeholder="e.g. Steel Gates & Fencing" />
            </div>
            <Switch name="inMenu" defaultChecked label="Show in the top menu" />
            <button className="btn btn-primary w-full">Create page</button>
          </form>
          <p className="mt-3 text-xs text-steel-text">The new page starts with a few example blocks you can change or delete.</p>
        </Card>
      </div>
    </>
  );
}
