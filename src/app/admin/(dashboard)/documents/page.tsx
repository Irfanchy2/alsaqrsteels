import { requireStaff } from "@/lib/admin";
import { formatBytes } from "@/lib/quote-client";
import { Card, Check, Field, Flash, PageTitle } from "@/components/admin/AdminUI";
import MediaUpload from "@/components/admin/MediaUpload";
import { saveDocument } from "../../actions";

type Doc = { id: string; title: string; kind: string; file_url: string; file_size: number | null; published: boolean };

function DocForm({ doc }: { doc?: Doc }) {
  return (
    <form action={saveDocument} className="space-y-4">
      {doc ? <input type="hidden" name="id" value={doc.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" defaultValue={doc?.title} required placeholder="Company profile 2026" />
        <div>
          <label htmlFor={`kind-${doc?.id ?? "new"}`} className="field-label">
            Type
          </label>
          <select id={`kind-${doc?.id ?? "new"}`} name="kind" defaultValue={doc?.kind ?? "company_profile"} className="input">
            <option value="company_profile">Company profile (download button on About page)</option>
            <option value="certificate">Certificate (listed on Quality page)</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <MediaUpload name="file" folder="documents" accept="application/pdf" defaultUrl={doc?.file_url} label="Upload PDF" maxMb={15} />
      {doc?.file_size ? <input type="hidden" name="file_bytes" value={doc.file_size} /> : null}
      {doc?.file_size ? <p className="text-sm text-steel-text">{formatBytes(doc.file_size)}</p> : null}
      <Check label="Published" name="published" defaultChecked={doc?.published} />
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-primary btn-sm">{doc ? "Save" : "Add document"}</button>
        {doc ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="delete" className="h-4 w-4" /> Delete
          </label>
        ) : null}
      </div>
    </form>
  );
}

export default async function AdminDocuments({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("documents").select("*").order("sort_order");
  return (
    <>
      <PageTitle title="Documents" />
      <Flash saved={saved} error={error} />
      <p className="mb-6 max-w-3xl text-sm text-steel-text">
        Download buttons appear on the website only for published documents. Upload the company profile here to show the
        download on the About page.
      </p>
      <div className="space-y-6">
        {((data ?? []) as Doc[]).map((d) => (
          <Card key={d.id}>
            <DocForm doc={d} />
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 text-lg font-bold">Add a document</h2>
          <DocForm />
        </Card>
      </div>
    </>
  );
}
