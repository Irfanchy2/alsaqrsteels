import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle, StatusPill } from "@/components/admin/AdminUI";

const STATUSES = ["all", "new", "reviewing", "quoted", "won", "lost", "closed", "spam"];

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; saved?: string; error?: string }>;
}) {
  const { status = "all", q, saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  let query = supabase
    .from("enquiries")
    .select("id, reference, created_at, name, company, phone, email, service, location, status, notification_status, enquiry_files(count)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all" && STATUSES.includes(status)) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ").trim().slice(0, 60);
    if (safe) query = query.or(`reference.ilike.%${safe}%,name.ilike.%${safe}%,company.ilike.%${safe}%`);
  }
  const { data, error: loadError } = await query;

  return (
    <>
      <PageTitle title="Enquiries">
        <a href="/admin/enquiries/export" className="btn btn-sm btn-secondary">
          Download CSV (Excel)
        </a>
      </PageTitle>
      <Flash saved={saved} error={error ?? loadError?.message} />
      <form className="mb-6 flex flex-wrap items-end gap-3" role="search">
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className="input !min-h-10 !py-2">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Reference, name or company" className="input !min-h-10 !py-2" />
        </div>
        <button className="btn btn-secondary btn-sm">Filter</button>
      </form>
      <div className="border border-line bg-card md:overflow-x-auto">
        <table className="rtable w-full text-sm md:min-w-[56rem]">
          <thead className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.1em] text-steel-text">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Service / location</th>
              <th className="px-4 py-3">Files</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Email alert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((e) => (
              <tr key={e.id} className="align-top">
                <td data-label="Reference" className="px-4 py-3 font-mono">
                  <Link href={`/admin/enquiries/${e.id}`} className="underline">
                    {e.reference}
                  </Link>
                </td>
                <td data-label="Received" className="whitespace-nowrap px-4 py-3">
                  {new Date(e.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td data-label="From" className="px-4 py-3">
                  <p className="font-medium">{e.name}</p>
                  <p className="text-steel-text">{[e.company, e.phone, e.email].filter(Boolean).join(" · ")}</p>
                </td>
                <td data-label="Service" className="px-4 py-3">
                  {e.service}
                  <p className="text-steel-text">{e.location}</p>
                </td>
                <td data-label="Files" className="px-4 py-3">{(e.enquiry_files as { count: number }[] | null)?.[0]?.count ?? 0}</td>
                <td data-label="Status" className="px-4 py-3">
                  <StatusPill value={e.status} />
                </td>
                <td data-label="Email alert" className="px-4 py-3">
                  <StatusPill value={e.notification_status} />
                </td>
              </tr>
            ))}
            {!data?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-steel-text">
                  No enquiries match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
