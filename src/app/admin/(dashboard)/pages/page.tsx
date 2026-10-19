import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";
import { PAGES } from "@/lib/content/pages";
import SetupNotice from "@/components/admin/SetupNotice";

export default async function AdminPages({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data, error: loadError } = await supabase.from("site_content").select("key, updated_at").like("key", "page:%");
  const edited = new Map((data ?? []).map((r: { key: string; updated_at: string }) => [r.key.slice(5), r.updated_at]));

  return (
    <>
      <PageTitle title="Pages & sections" />
      <Flash saved={saved} error={error} />
      {loadError ? <SetupNotice /> : null}
      <p className="mb-6 max-w-2xl text-steel-text">
        Change the headings, text, buttons and photos of every section on the website, or hide a section. Projects, services,
        blog posts and FAQs have their own pages in the menu.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAGES.map((p) => {
          const at = edited.get(p.key);
          return (
            <li key={p.key}>
              <Link
                href={`/admin/pages/${p.key}`}
                className="group flex h-full flex-col rounded-lg border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-flame/50 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{p.label}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${at ? "bg-ok-bg text-ok" : "bg-paper-2 text-steel-text"}`}>
                    {at ? "Customised" : "Original text"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-steel-text">{p.path}</p>
                <p className="mt-4 text-sm text-steel-text">
                  {p.sections.length} section{p.sections.length > 1 ? "s" : ""}: {p.sections.map((s) => s.label).join(", ")}
                </p>
                {at ? (
                  <p className="mt-auto pt-4 text-xs text-steel-text">
                    Last saved {new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                ) : null}
                <p className="mt-auto pt-4 text-sm font-semibold text-accent group-hover:underline">Edit sections →</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
