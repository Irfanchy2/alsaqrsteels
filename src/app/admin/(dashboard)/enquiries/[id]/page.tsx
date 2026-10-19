import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { formatBytes } from "@/lib/quote-client";
import { Card, Flash, PageTitle, StatusPill } from "@/components/admin/AdminUI";
import { updateEnquiry, retryNotification, deleteEnquiry } from "../../../actions";

const STATUSES = ["new", "reviewing", "quoted", "won", "lost", "closed", "spam"];

export default async function EnquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStaff();
  const { data: e } = await supabase.from("enquiries").select("*, enquiry_files(*)").eq("id", id).maybeSingle();
  if (!e) notFound();

  // Short-lived links, generated with the staff member's own session.
  const files = await Promise.all(
    ((e.enquiry_files ?? []) as { id: string; storage_path: string; original_name: string; mime_type: string; size_bytes: number }[]).map(
      async (f) => {
        const { data } = await supabase.storage.from("enquiry-files").createSignedUrl(f.storage_path, 600, { download: f.original_name });
        return { ...f, url: data?.signedUrl ?? null };
      }
    )
  );

  const rows: [string, React.ReactNode][] = [
    ["Received", new Date(e.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "full", timeStyle: "short" })],
    ["Name", e.name],
    ["Company", e.company],
    ["Phone", e.phone ? <a href={`tel:${e.phone.replace(/[^+0-9]/g, "")}`} className="underline">{e.phone}</a> : null],
    ["Email", e.email ? <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry ${e.reference}`)}`} className="underline">{e.email}</a> : null],
    ["Service", e.service],
    ["Location", e.location],
    ["Dimensions", e.dimensions],
    ["Quantities", e.quantities],
    ["Target date", e.target_date],
    ["Source", e.source === "assistant" ? "Quote form (prepared with the AI assistant)" : "Quote form"],
  ];

  return (
    <>
      <PageTitle title={e.reference} back={{ href: "/admin/enquiries", label: "Enquiries" }}>
        <StatusPill value={e.status} />
      </PageTitle>
      <Flash saved={saved} error={error} />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card>
            <dl className="divide-y divide-line">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                    <dt className="font-mono text-xs uppercase tracking-[0.1em] text-steel-text sm:pt-0.5">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <h2 className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-steel-text">Scope</h2>
            <p className="mt-2 whitespace-pre-wrap">{e.scope}</p>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Attachments ({files.length})</h2>
            {files.length ? (
              <ul className="mt-4 divide-y divide-line">
                {files.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span>
                      {f.original_name} <span className="text-sm text-steel-text">· {formatBytes(f.size_bytes)}</span>
                    </span>
                    {f.url ? (
                      <a href={f.url} className="btn btn-secondary btn-sm">
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-danger">File unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-steel-text">No files were attached.</p>
            )}
            <p className="mt-3 text-xs text-steel-text">Download links expire after 10 minutes. Reload the page for new links.</p>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <h2 className="text-lg font-bold">Follow-up</h2>
            <form action={updateEnquiry} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <div>
                <label htmlFor="status" className="field-label">
                  Status
                </label>
                <select id="status" name="status" defaultValue={e.status} className="input">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="staff_notes" className="field-label">
                  Internal notes
                </label>
                <textarea id="staff_notes" name="staff_notes" rows={5} defaultValue={e.staff_notes ?? ""} className="input" />
              </div>
              <button className="btn btn-primary btn-sm">Save</button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Email alert</h2>
            <p className="mt-2">
              <StatusPill value={e.notification_status} />
            </p>
            {e.notification_error ? <p className="mt-2 text-sm text-steel-text">{e.notification_error}</p> : null}
            {e.notification_status !== "sent" ? (
              <form action={retryNotification} className="mt-4">
                <input type="hidden" name="id" value={e.id} />
                <button className="btn btn-secondary btn-sm">Send notification again</button>
              </form>
            ) : null}
          </Card>
          <Card className="border-danger">
            <h2 className="text-lg font-bold">Delete</h2>
            <p className="mt-2 text-sm text-steel-text">Permanently deletes this enquiry and its attachments.</p>
            <form action={deleteEnquiry} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={e.id} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="confirm" className="h-4 w-4" /> I understand this cannot be undone
              </label>
              <button className="btn btn-secondary btn-sm border-danger text-danger">Delete enquiry</button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
