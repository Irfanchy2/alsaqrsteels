import { requireStaff } from "@/lib/admin";
import { Card, Field, Flash, PageTitle } from "@/components/admin/AdminUI";
import { saveCompany, saveHighlight, saveStep } from "../../actions";

type Row = { id: string; sort_order: number; published: boolean };

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const [{ data: s }, { data: highlights }, { data: steps }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("highlights").select("*").order("sort_order"),
    supabase.from("process_steps").select("*").order("sort_order"),
  ]);

  return (
    <>
      <PageTitle title="Company info" />
      <Flash saved={saved} error={error} />
      <form action={saveCompany} className="max-w-3xl space-y-8">
        <Card className="space-y-5">
          <h2 className="text-lg font-bold">Contact details</h2>
          <p className="text-sm text-steel-text">Shown in the header, footer, contact page, structured data and the AI assistant.</p>
          <Field label="Company name" name="company_name" defaultValue={s?.company_name} required />
          <Field label="Address" name="address" defaultValue={s?.address} textarea rows={2} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Main phone" name="phone_1" defaultValue={s?.phone_1} placeholder="+971 55 927 0303" />
            <Field label="Second phone" name="phone_2" defaultValue={s?.phone_2} />
            <Field label="WhatsApp number (digits, with country code)" name="whatsapp" defaultValue={s?.whatsapp} placeholder="971559270303" />
            <Field label="Public email" name="email" type="email" defaultValue={s?.email} />
            <Field label="Established (year)" name="established_year" type="number" defaultValue={s?.established_year} />
            <Field label="Google Maps link" name="maps_url" defaultValue={s?.maps_url} />
            <Field label="Facebook" name="facebook_url" defaultValue={s?.facebook_url} />
            <Field label="Instagram" name="instagram_url" defaultValue={s?.instagram_url} />
          </div>
          <Field label="Opening hours" name="business_hours" defaultValue={s?.business_hours} />
        </Card>
        <Card className="space-y-5">
          <h2 className="text-lg font-bold">Wording</h2>
          <Field label="Home page headline" name="hero_title" defaultValue={s?.hero_title} />
          <Field label="Home page introduction" name="hero_subtitle" defaultValue={s?.hero_subtitle} textarea rows={3} />
          <Field label="Footer tagline" name="tagline" defaultValue={s?.tagline} textarea rows={2} />
          <Field label="About heading" name="about_title" defaultValue={s?.about_title} />
          <Field label="About text (blank line between paragraphs)" name="about_body" defaultValue={s?.about_body} textarea rows={8} />
        </Card>
        <button className="btn btn-primary">Save company details</button>
      </form>

      <section id="highlights" className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-bold">Home page highlights</h2>
        <p className="mt-1 text-sm text-steel-text">Only verifiable facts — no unconfirmed statistics.</p>
        <div className="mt-5 space-y-4">
          {[...((highlights ?? []) as (Row & { label: string; value: string; detail: string | null })[]), null].map((h, i) => (
            <Card key={h?.id ?? `new-${i}`}>
              <form action={saveHighlight} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_5rem]">
                {h ? <input type="hidden" name="id" value={h.id} /> : null}
                <input name="label" defaultValue={h?.label} placeholder="Label" className="input !min-h-10 !py-2" aria-label="Label" />
                <input name="value" defaultValue={h?.value} placeholder="Value" className="input !min-h-10 !py-2" aria-label="Value" />
                <input name="detail" defaultValue={h?.detail ?? ""} placeholder="Detail" className="input !min-h-10 !py-2" aria-label="Detail" />
                <input name="sort_order" type="number" defaultValue={h?.sort_order ?? 0} className="input !min-h-10 !py-2" aria-label="Order" />
                <div className="flex flex-wrap items-center gap-4 text-sm sm:col-span-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="published" defaultChecked={h?.published ?? true} className="h-4 w-4" /> Published
                  </label>
                  {h ? (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="delete" className="h-4 w-4" /> Delete
                    </label>
                  ) : null}
                  <button className="btn btn-secondary btn-sm">{h ? "Save" : "Add highlight"}</button>
                </div>
              </form>
            </Card>
          ))}
        </div>
      </section>

      <section id="process" className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-bold">Project process</h2>
        <p className="mt-1 text-sm text-steel-text">Shown on the home and About pages. Keep it to how you actually work.</p>
        <div className="mt-5 space-y-4">
          {[...((steps ?? []) as (Row & { title: string; body: string })[]), null].map((st, i) => (
            <Card key={st?.id ?? `new-${i}`}>
              <form action={saveStep} className="space-y-3">
                {st ? <input type="hidden" name="id" value={st.id} /> : null}
                <div className="grid gap-3 sm:grid-cols-[1fr_5rem]">
                  <input name="title" defaultValue={st?.title} placeholder="Step title" className="input !min-h-10 !py-2" aria-label="Step title" />
                  <input name="sort_order" type="number" defaultValue={st?.sort_order ?? 0} className="input !min-h-10 !py-2" aria-label="Order" />
                </div>
                <textarea name="body" defaultValue={st?.body} rows={2} className="input !min-h-16" placeholder="Description" aria-label="Description" />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="published" defaultChecked={st?.published ?? true} className="h-4 w-4" /> Published
                  </label>
                  {st ? (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="delete" className="h-4 w-4" /> Delete
                    </label>
                  ) : null}
                  <button className="btn btn-secondary btn-sm">{st ? "Save" : "Add step"}</button>
                </div>
              </form>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
