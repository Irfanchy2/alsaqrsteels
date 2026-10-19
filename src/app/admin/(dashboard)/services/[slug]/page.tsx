import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { Card, Check, Field, Flash, PageTitle } from "@/components/admin/AdminUI";
import MediaUpload from "@/components/admin/MediaUpload";
import { saveService } from "../../../actions";

export default async function EditService({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ slug }, { saved, error }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStaff();
  const { data: s } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  if (!s) notFound();
  return (
    <>
      <PageTitle title={s.title} back={{ href: "/admin/services", label: "Services" }}>
        <Link href={`/services/${s.slug}`} target="_blank" className="btn btn-secondary btn-sm">
          View on site ↗
        </Link>
      </PageTitle>
      <Flash saved={saved} error={error} />
      <form action={saveService} className="max-w-3xl space-y-8">
        <input type="hidden" name="slug" value={s.slug} />
        <Card className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[6rem_1fr_8rem]">
            <Field label="No." name="number" defaultValue={s.number} />
            <Field label="Title" name="title" defaultValue={s.title} required />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={s.sort_order} />
          </div>
          <Field label="Summary (lists and cards)" name="summary" defaultValue={s.summary} textarea rows={2} />
          <Field label="Introduction (service page)" name="intro" defaultValue={s.intro} textarea rows={4} />
          <Field label="Scope — one item per line" name="scope" defaultValue={(s.bullets ?? []).join("\n")} textarea rows={6} />
          <Field label="Applications — one per line" name="applications" defaultValue={(s.applications ?? []).join("\n")} textarea rows={4} />
          <Check label="Published" name="published" defaultChecked={s.published} />
        </Card>
        <Card className="space-y-5">
          <h2 className="text-lg font-bold">Image</h2>
          <p className="text-sm text-steel-text">
            Use a genuine photograph of your own work. Without one, the page shows the line illustration below.
          </p>
          <MediaUpload name="image" folder={`services/${s.slug}`} defaultUrl={s.image_url}
            label="Upload photo"
            withSize
            defaultWidth={s.image_width}
            defaultHeight={s.image_height}
          />
          <Field label="Photo description (alt text)" name="image_alt" defaultValue={s.image_alt} />
          <div>
            <label htmlFor="f-ill" className="field-label">
              Illustration
            </label>
            <select id="f-ill" name="illustration" defaultValue={s.illustration ?? "ibeam"} className="input">
              <option value="ibeam">Beam and section</option>
              <option value="pipe">Pipe spool and support</option>
              <option value="cnc">CNC cut plate</option>
              <option value="tank">Tank on skid frame</option>
              <option value="rail">Stair, handrail and platform</option>
            </select>
          </div>
        </Card>
        <Card className="space-y-5">
          <h2 className="text-lg font-bold">Search results</h2>
          <Field label="Page title" name="seo_title" defaultValue={s.seo_title} hint="About 50–60 characters." />
          <Field label="Description" name="seo_description" defaultValue={s.seo_description} textarea rows={2} hint="About 140–160 characters." />
        </Card>
        <button className="btn btn-primary">Save service</button>
      </form>
    </>
  );
}
