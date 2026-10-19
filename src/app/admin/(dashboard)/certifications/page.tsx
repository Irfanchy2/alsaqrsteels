import { requireStaff } from "@/lib/admin";
import { Card, Check, Field, Flash, PageTitle } from "@/components/admin/AdminUI";
import MediaUpload from "@/components/admin/MediaUpload";
import { saveCertification } from "../../actions";

type Cert = {
  id: string;
  title: string;
  standard: string | null;
  issuer: string | null;
  holder_name: string | null;
  certificate_number: string | null;
  valid_until: string | null;
  image_url: string | null;
  file_url: string | null;
  verified: boolean;
  published: boolean;
  staff_note: string | null;
  sort_order: number;
};

function CertForm({ cert }: { cert?: Cert }) {
  const expired = cert?.valid_until ? new Date(cert.valid_until) < new Date(new Date().toDateString()) : false;
  return (
    <form action={saveCertification} className="space-y-5">
      {cert ? <input type="hidden" name="id" value={cert.id} /> : null}
      {cert?.staff_note ? <p className="border-s-4 border-warn bg-warn-bg px-3 py-2 text-sm">{cert.staff_note}</p> : null}
      {expired ? <p className="border-s-4 border-danger bg-danger-bg px-3 py-2 text-sm">This certificate has expired and is not shown on the website.</p> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" name="title" defaultValue={cert?.title} required placeholder="ISO 9001:2015 Quality Management" />
        <Field label="Standard / scheme" name="standard" defaultValue={cert?.standard} />
        <Field label="Certificate holder (exactly as printed)" name="holder_name" defaultValue={cert?.holder_name} />
        <Field label="Issued by (certification body)" name="issuer" defaultValue={cert?.issuer} />
        <Field label="Certificate number" name="certificate_number" defaultValue={cert?.certificate_number} />
        <Field label="Valid until" name="valid_until" type="date" defaultValue={cert?.valid_until} />
        <Field label="Sort order" name="sort_order" type="number" defaultValue={cert?.sort_order ?? 0} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="field-label">Certificate image</p>
          <MediaUpload name="image" folder="certificates" defaultUrl={cert?.image_url} label="Upload image" />
        </div>
        <div>
          <p className="field-label">Certificate PDF</p>
          <MediaUpload name="file" folder="certificates" accept="application/pdf" defaultUrl={cert?.file_url} label="Upload PDF" />
        </div>
      </div>
      <Field label="Internal note" name="staff_note" defaultValue={cert?.staff_note} textarea rows={2} />
      <div className="space-y-3 border-t border-line pt-4">
        <Check
          label="Checked and current"
          name="verified"
          defaultChecked={cert?.verified}
          hint="Tick only after confirming the holder is this company and the certificate is valid."
        />
        <Check label="Show on the website" name="published" defaultChecked={cert?.published} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-primary btn-sm">{cert ? "Save" : "Add certificate"}</button>
        {cert ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="delete" className="h-4 w-4" /> Delete this record
          </label>
        ) : null}
      </div>
    </form>
  );
}

export default async function AdminCerts({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("certifications").select("*").order("sort_order");
  return (
    <>
      <PageTitle title="Certifications" />
      <Flash saved={saved} error={error} />
      <p className="mb-6 max-w-3xl text-sm text-steel-text">
        The website lists a certificate only when it is marked “Checked and current”, is set to show, and has not passed its
        expiry date. Until then the Quality page invites visitors to request copies.
      </p>
      <div className="space-y-6">
        {((data ?? []) as Cert[]).map((c) => (
          <Card key={c.id}>
            <CertForm cert={c} />
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 text-lg font-bold">Add a certificate</h2>
          <CertForm />
        </Card>
      </div>
    </>
  );
}
