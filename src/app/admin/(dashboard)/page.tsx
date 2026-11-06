import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { Flash, StatusPill } from "@/components/admin/AdminUI";

const STAGES = ["new", "reviewing", "quoted", "won", "lost"] as const;

const ACTIONS = [
  { href: "/admin/enquiries", icon: "✉️", title: "Messages & quotes", text: "Read and answer quote requests." },
  { href: "/admin/projects", icon: "📷", title: "Add a project", text: "New jobs and site photos." },
  { href: "/admin/blog", icon: "📝", title: "Write a blog post", text: "Articles that bring visitors from Google." },
  { href: "/admin/builder", icon: "🧱", title: "Page builder", text: "Move, add or hide page sections." },
  { href: "/admin/pages", icon: "✏️", title: "Page text", text: "Headings, wording and buttons." },
  { href: "/admin/settings", icon: "🏢", title: "Company info", text: "Phone, address, hours, social links." },
];

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const supabase = await createClient();
  const count = (status: string) => supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", status);

  // The staff check and every dashboard query run at the same time: each one
  // is a round trip to the database, so waiting for them one after another is
  // what made the first screen after sign-in slow. Row-level security already
  // limits these reads to staff; requireStaff() still redirects anyone else.
  const [{ user }, notifyIssues, recent, events, projectsNoPhotos, traffic, posts, ...stages] = await Promise.all([
    requireStaff(),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).in("notification_status", ["failed", "not_configured"]),
    supabase.from("enquiries").select("id, reference, created_at, name, company, service, status, notification_status").order("created_at", { ascending: false }).limit(6),
    supabase.rpc("admin_event_counts", { p_since: since }),
    supabase.from("projects").select("id, project_images(id)").eq("published", true).not("slug", "is", null),
    supabase.rpc("admin_traffic", { p_since: since }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    ...STAGES.map(count),
  ]);

  const visits = (traffic.data as { visits?: number; views?: number } | null) ?? {};
  const pipeline = Object.fromEntries(STAGES.map((s, i) => [s, stages[i].count ?? 0]));
  const counts: Record<string, number> = {};
  for (const e of (events.data ?? []) as { name: string; channel: string | null; n: number }[]) {
    const key = e.name === "contact_click" ? `contact_click:${e.channel ?? "other"}` : e.name;
    counts[key] = (counts[key] ?? 0) + Number(e.n);
  }
  const clicks = { phone: counts["contact_click:phone"] ?? 0, whatsapp: counts["contact_click:whatsapp"] ?? 0, email: counts["contact_click:email"] ?? 0 };
  const missingPhotos = (projectsNoPhotos.data ?? []).filter((p) => !(p.project_images as unknown[] | null)?.length).length;
  const name = user.email.split("@")[0];

  const KPIS = [
    { label: "New enquiries", value: pipeline.new, note: "Waiting for a reply", href: "/admin/enquiries?status=new", hot: pipeline.new > 0 },
    { label: "Website visits", value: visits.visits ?? 0, note: `${visits.views ?? 0} page views · 30 days`, href: "/admin/analytics" },
    { label: "Quote requests", value: counts.enquiry_submitted ?? 0, note: `${counts.quote_start ?? 0} started the form · 30 days`, href: "/admin/enquiries" },
    { label: "Calls & WhatsApp", value: clicks.phone + clicks.whatsapp + clicks.email, note: `Phone ${clicks.phone} · WhatsApp ${clicks.whatsapp} · Email ${clicks.email}`, href: "/admin/analytics" },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel-text">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dubai" })}
          </p>
          <h1 className="mt-1 text-3xl font-bold normal-case tracking-normal [font-stretch:100%]">Hello, {name}</h1>
        </div>
        <a href="/" target="_blank" rel="noopener" className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-flame/60">
          View website ↗
        </a>
      </div>
      <Flash error={error} />

      {(notifyIssues.count ?? 0) > 0 ? (
        <p className="mb-6 rounded-lg border-s-4 border-warn bg-warn-bg px-4 py-3 text-sm">
          {notifyIssues.count} {notifyIssues.count === 1 ? "enquiry has" : "enquiries have"} no email notification (failed or not configured). They are
          saved: check the <Link href="/admin/enquiries" className="underline">enquiries list</Link>.
        </p>
      ) : null}

      {/* Key numbers */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <li key={k.label}>
            <Link
              href={k.href}
              className={`block h-full rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)] ${
                k.hot ? "border-flame/60" : "border-line"
              }`}
            >
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel-text">{k.label}</p>
              <p className={`mt-2 text-4xl font-bold tabular-nums ${k.hot ? "text-accent" : ""}`}>{k.value}</p>
              <p className="mt-2 text-sm text-steel-text">{k.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Quick actions */}
      <h2 className="mb-3 mt-10 text-lg font-bold">Quick actions</h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {ACTIONS.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:border-flame/50"
            >
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper-2 text-xl">
                {a.icon}
              </span>
              <span className="font-semibold leading-snug group-hover:text-accent">{a.title}</span>
              <span className="text-xs text-steel-text">{a.text}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 xl:grid-cols-3">
        {/* Latest enquiries */}
        <section className="xl:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold">Latest enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm underline">
              See all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
            {(recent.data ?? []).map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {e.name}
                      {e.company ? <span className="font-normal text-steel-text"> · {e.company}</span> : null}
                    </span>
                    <span className="block truncate text-sm text-steel-text">
                      {e.service ?? "General enquiry"} · <span className="font-mono">{e.reference}</span> ·{" "}
                      {new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dubai" })}
                    </span>
                  </span>
                  <StatusPill value={e.status} />
                  {e.notification_status !== "sent" ? <StatusPill value={e.notification_status} /> : null}
                </Link>
              </li>
            ))}
            {!recent.data?.length ? <li className="px-4 py-6 text-sm text-steel-text">No enquiries yet.</li> : null}
          </ul>
        </section>

        <aside className="space-y-6">
          {/* Pipeline */}
          <section>
            <h2 className="text-lg font-bold">Enquiry pipeline</h2>
            <ul className="mt-3 grid grid-cols-5 gap-2 text-center">
              {STAGES.map((st) => (
                <li key={st}>
                  <Link href={`/admin/enquiries?status=${st}`} className="block rounded-lg border border-line bg-card py-2 hover:border-flame/60">
                    <span className="block text-2xl font-bold tabular-nums">{pipeline[st]}</span>
                    <span className="block font-mono text-[0.6rem] uppercase tracking-[0.06em] text-steel-text">{st}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* To do */}
          <section>
            <h2 className="text-lg font-bold">Website health</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3">
                <span>
                  {missingPhotos ? (
                    <>
                      <strong>{missingPhotos}</strong> published {missingPhotos === 1 ? "project has" : "projects have"} no photos
                    </>
                  ) : (
                    "Every published project has photos"
                  )}
                </span>
                <Link href="/admin/projects" className="shrink-0 underline">
                  Projects
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3">
                <span>
                  <strong>{posts.count ?? 0}</strong> blog posts live
                </span>
                <Link href="/admin/blog" className="shrink-0 underline">
                  Blog
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3">
                <span>
                  Website assistant opened <strong>{counts.assistant_open ?? 0}</strong> times
                </span>
                <span className="shrink-0 text-steel-text">30 days</span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3">
                <span>Two-step sign-in protects your account</span>
                <Link href="/admin/security" className="shrink-0 underline">
                  Security
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
