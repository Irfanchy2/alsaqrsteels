import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Card, Flash, PageTitle, StatusPill } from "@/components/admin/AdminUI";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireStaff();
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [newCount, notifyIssues, recent, events, projectsNoPhotos, certsLive, traffic, statuses] = await Promise.all([
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).in("notification_status", ["failed", "not_configured"]),
    supabase.from("enquiries").select("id, reference, created_at, name, company, service, status, notification_status").order("created_at", { ascending: false }).limit(8),
    supabase.rpc("admin_event_counts", { p_since: since }),
    supabase.from("projects").select("id, title, project_images(id)").eq("published", true).not("slug", "is", null),
    supabase.from("certifications").select("id", { count: "exact", head: true }).eq("published", true).eq("verified", true),
    supabase.rpc("admin_traffic", { p_since: since }),
    supabase.from("enquiries").select("status").limit(3000),
  ]);
  const visits = (traffic.data as { visits?: number; views?: number } | null) ?? {};
  const pipeline: Record<string, number> = {};
  for (const r of (statuses.data ?? []) as { status: string }[]) pipeline[r.status] = (pipeline[r.status] ?? 0) + 1;
  const STAGES = ["new", "reviewing", "quoted", "won", "lost"];

  const counts: Record<string, number> = {};
  for (const e of (events.data ?? []) as { name: string; channel: string | null; n: number }[]) {
    const key = e.name === "contact_click" ? `contact_click:${e.channel ?? "other"}` : e.name;
    counts[key] = (counts[key] ?? 0) + Number(e.n);
  }
  const missingPhotos = (projectsNoPhotos.data ?? []).filter((p) => !(p.project_images as unknown[] | null)?.length);

  return (
    <>
      <PageTitle title="Welcome" />
      <Flash error={error} />

      <h2 className="mb-3 text-lg font-bold">What do you want to do?</h2>
      <ul className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { href: "/admin/builder", icon: "🧱", title: "Change how a page looks", text: "Drag and drop blocks, add photos and galleries, hide or move sections." },
          { href: "/admin/pages", icon: "✏️", title: "Change wording on a page", text: "Headings, text and buttons of the existing sections." },
          { href: "/admin/projects", icon: "📷", title: "Add a project or photos", text: "New jobs, site photos and project details." },
          { href: "/admin/services", icon: "⚙️", title: "Add or edit a service", text: "New services, photos, order on the website." },
          { href: "/admin/enquiries", icon: "✉️", title: "Read messages & quotes", text: "Quote requests sent from the website." },
          { href: "/admin/settings", icon: "🏢", title: "Change phone, address or hours", text: "Company details shown across the site." },
        ].map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex h-full gap-4 rounded-xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-flame/50 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)]"
            >
              <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-paper-2 text-2xl">
                {c.icon}
              </span>
              <span>
                <span className="block font-semibold group-hover:text-accent">{c.title}</span>
                <span className="mt-1 block text-sm text-steel-text">{c.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mb-3 text-lg font-bold">At a glance</h2>

      {(notifyIssues.count ?? 0) > 0 ? (
        <p className="mb-6 border-s-4 border-warn bg-warn-bg px-4 py-3 text-sm">
          {notifyIssues.count} {notifyIssues.count === 1 ? "enquiry has" : "enquiries have"} no email notification (failed or not
          configured). They are saved — check the <Link href="/admin/enquiries" className="underline">enquiries list</Link>.
        </p>
      ) : null}


      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Website visits (30 days)</p>
          <p className="mt-2 text-4xl font-bold tabular-nums">{visits.visits ?? 0}</p>
          <p className="mt-2 text-sm text-steel-text">
            {visits.views ?? 0} page views ·{" "}
            <Link href="/admin/analytics" className="underline">Full report</Link>
          </p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Enquiry pipeline</p>
          <ul className="mt-3 grid grid-cols-5 gap-2 text-center">
            {STAGES.map((st) => (
              <li key={st}>
                <Link href={`/admin/enquiries?status=${st}`} className="block border border-line py-2 hover:border-ink">
                  <span className="block text-2xl font-bold tabular-nums">{pipeline[st] ?? 0}</span>
                  <span className="block font-mono text-[0.62rem] uppercase tracking-[0.08em] text-steel-text">{st}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">New enquiries</p>
          <p className="mt-2 text-4xl font-bold">{newCount.count ?? 0}</p>
          <Link href="/admin/enquiries?status=new" className="mt-2 inline-block text-sm underline">
            Review
          </Link>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Submitted (30 days)</p>
          <p className="mt-2 text-4xl font-bold">{counts.enquiry_submitted ?? 0}</p>
          <p className="mt-2 text-sm text-steel-text">Quote form starts: {counts.quote_start ?? 0}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Contact clicks (30 days)</p>
          <p className="mt-2 text-4xl font-bold">
            {(counts["contact_click:phone"] ?? 0) + (counts["contact_click:whatsapp"] ?? 0) + (counts["contact_click:email"] ?? 0)}
          </p>
          <p className="mt-2 text-sm text-steel-text">
            Phone {counts["contact_click:phone"] ?? 0} · WhatsApp {counts["contact_click:whatsapp"] ?? 0} · Email {counts["contact_click:email"] ?? 0}
          </p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Assistant (30 days)</p>
          <p className="mt-2 text-4xl font-bold">{counts.assistant_open ?? 0}</p>
          <p className="mt-2 text-sm text-steel-text">Hand-offs to quote form: {counts.assistant_handoff ?? 0}</p>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <h2 className="text-xl font-bold">Latest enquiries</h2>
          <div className="mt-4 border border-line bg-card md:overflow-x-auto">
            <table className="rtable w-full text-sm md:min-w-[40rem]">
              <thead className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.1em] text-steel-text">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(recent.data ?? []).map((e) => (
                  <tr key={e.id}>
                    <td data-label="Reference" className="px-4 py-3 font-mono">
                      <Link href={`/admin/enquiries/${e.id}`} className="underline">
                        {e.reference}
                      </Link>
                    </td>
                    <td data-label="From" className="px-4 py-3">
                      {e.name}
                      {e.company ? <span className="text-steel-text"> · {e.company}</span> : null}
                    </td>
                    <td data-label="Service" className="px-4 py-3">{e.service}</td>
                    <td data-label="Status" className="px-4 py-3">
                      <StatusPill value={e.status} />
                    </td>
                    <td data-label="Email alert" className="px-4 py-3">
                      <StatusPill value={e.notification_status} />
                    </td>
                  </tr>
                ))}
                {!recent.data?.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-steel-text">
                      No enquiries yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold">Content to complete</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="border border-line bg-card p-4">
              <strong>{missingPhotos.length}</strong> published {missingPhotos.length === 1 ? "project has" : "projects have"} no
              photographs.{" "}
              <Link href="/admin/projects" className="underline">
                Add photos
              </Link>
            </li>
            <li className="border border-line bg-card p-4">
              <strong>{certsLive.count ?? 0}</strong> certificates are published.{" "}
              <Link href="/admin/certifications" className="underline">
                Review certifications
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
