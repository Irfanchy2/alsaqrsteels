import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";
import { PAGES, type PageValues } from "@/lib/content/pages";
import MediaUpload from "@/components/admin/MediaUpload";
import SetupNotice from "@/components/admin/SetupNotice";
import Switch from "@/components/admin/Switch";
import { savePage, resetPage } from "../../../actions";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { key } = await params;
  const { saved, error } = await searchParams;
  const def = PAGES.find((p) => p.key === key);
  if (!def) notFound();
  const { supabase } = await requireStaff();
  const { data, error: loadError } = await supabase.from("site_content").select("data").eq("key", `page:${key}`).maybeSingle();
  const values = ((data?.data as PageValues | undefined) ?? {}) as PageValues;

  return (
    <>
      <PageTitle title={`${def.label} page`} back={{ href: "/admin/pages", label: "All pages" }}>
        <a href={def.path} target="_blank" className="btn btn-sm btn-secondary">
          Preview page ↗
        </a>
      </PageTitle>
      <Flash saved={saved} error={error} />
      {loadError ? <SetupNotice /> : null}

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="sticky top-6 space-y-1 text-sm">
            {def.sections.map((s) => (
              <li key={s.key}>
                <a href={`#sec-${s.key}`} className="block rounded-md px-3 py-1.5 text-steel-text hover:bg-paper-2 hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <form action={savePage} className="min-w-0 space-y-5 pb-28">
          <input type="hidden" name="page" value={def.key} />
          {def.sections.map((s) => {
            const v = values[s.key] ?? {};
            const hidden = v._hidden === true;
            return (
              <section key={s.key} id={`sec-${s.key}`} className="scroll-mt-6 rounded-lg border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <h2 className="text-lg font-bold">{s.label}</h2>
                    {s.note ? <p className="mt-0.5 text-sm text-steel-text">{s.note}</p> : null}
                  </div>
                  {s.hideable ? <Switch name={`${s.key}._visible`} defaultChecked={!hidden} label="Show on website" /> : null}
                </header>
                {s.fields.length ? (
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {s.fields.map((f) => {
                      const id = `${s.key}.${f.key}`;
                      const current = typeof v[f.key] === "string" ? (v[f.key] as string) : "";
                      if (f.type === "image")
                        return (
                          <div key={id} className="sm:col-span-2">
                            <p className="field-label">{f.label}</p>
                            <MediaUpload name={id} folder={`pages/${def.key}`} defaultUrl={current || null} label="Upload photo" />
                            {f.hint ? <span className="field-hint">{f.hint}</span> : null}
                          </div>
                        );
                      return (
                        <div key={id} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                          <label htmlFor={id} className="field-label">
                            {f.label}
                          </label>
                          {f.type === "textarea" ? (
                            <textarea id={id} name={id} rows={3} className="input" defaultValue={current || f.default} />
                          ) : (
                            <input id={id} name={id} className="input" defaultValue={current || f.default} placeholder={f.default ? undefined : f.hint} />
                          )}
                          {f.hint && f.default ? <span className="field-hint">{f.hint}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-5 py-4 text-sm text-steel-text">This section has no text to edit; use the switch to show or hide it.</p>
                )}
              </section>
            );
          })}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:start-64">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-steel-text">Changes go live within a minute of saving.</p>
              <div className="flex gap-3">
                <button formAction={resetPage} formNoValidate className="btn btn-sm btn-secondary">
                  Reset to original
                </button>
                <button className="btn btn-sm btn-primary">Save {def.label} page</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
