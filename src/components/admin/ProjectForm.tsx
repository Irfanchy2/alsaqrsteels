import { Card, Check, Field } from "./AdminUI";
import { saveProject } from "@/app/admin/actions";

type ProjectRow = {
  id?: string;
  title?: string;
  slug?: string | null;
  code?: string | null;
  location?: string | null;
  emirate?: string | null;
  sector?: string | null;
  status?: string | null;
  scope?: string | null;
  description?: string | null;
  services?: string[] | null;
  client_name?: string | null;
  client_public?: boolean | null;
  year?: string | null;
  featured?: boolean | null;
  published?: boolean | null;
  sort_order?: number | null;
};

export default function ProjectForm({ project, services }: { project?: ProjectRow; services: { slug: string; title: string }[] }) {
  const p = project ?? {};
  return (
    <form action={saveProject} className="space-y-8">
      {p.id ? <input type="hidden" name="id" value={p.id} /> : null}
      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Project name" name="title" defaultValue={p.title} required />
          <Field label="Web address (slug)" name="slug" defaultValue={p.slug} hint="Leave blank to create from the name. Changing it breaks old links." />
          <Field label="Project number" name="code" defaultValue={p.code} placeholder="PRJ-08" />
          <Field label="Sort order" name="sort_order" type="number" defaultValue={p.sort_order ?? 0} />
          <Field label="Location" name="location" defaultValue={p.location} placeholder="e.g. Musaffah, Abu Dhabi" />
          <Field label="Emirate" name="emirate" defaultValue={p.emirate} placeholder="Abu Dhabi" />
          <Field label="Sector" name="sector" defaultValue={p.sector} placeholder="Oil & gas / Industrial / Infrastructure / Residential & commercial" />
          <div>
            <label htmlFor="f-status" className="field-label">
              Status
            </label>
            <select id="f-status" name="status" defaultValue={p.status ?? "completed"} className="input">
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
          <Field label="Year (only if documented)" name="year" defaultValue={p.year} />
        </div>
        <Field label="Our scope on this project" name="scope" defaultValue={p.scope} placeholder="Structural steel fabrication and erection" />
        <Field label="Description" name="description" defaultValue={p.description} textarea rows={5} hint="State only verified facts: what we did, where. No quantities, dates or outcomes unless documented." />
        <fieldset>
          <legend className="field-label">Related services</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label key={s.slug} className="flex items-center gap-2">
                <input type="checkbox" name="services" value={s.slug} defaultChecked={p.services?.includes(s.slug)} className="h-4 w-4" />
                {s.title}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>
      <Card className="space-y-5">
        <h2 className="text-lg font-bold">Client and visibility</h2>
        <Field label="Client name (private unless allowed below)" name="client_name" defaultValue={p.client_name} />
        <Check
          label="Client may be named on the website"
          name="client_public"
          defaultChecked={!!p.client_public}
          hint="Only tick with the client's written permission."
        />
        <Check label="Published" name="published" defaultChecked={p.published ?? false} />
        <Check label="Featured on the home page" name="featured" defaultChecked={!!p.featured} />
      </Card>
      <button className="btn btn-primary">{p.id ? "Save project" : "Create project"}</button>
    </form>
  );
}
