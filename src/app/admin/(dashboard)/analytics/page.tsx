import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { Card, PageTitle } from "@/components/admin/AdminUI";

type Row = { k: string; n: number };
type Traffic = {
  views: number;
  visits: number;
  daily: { d: string; views: number; visits: number }[];
  pages: Row[];
  refs: Row[];
  devices: Row[];
  countries: Row[];
};
const RANGES = [7, 28, 90];
const EMPTY: Traffic = { views: 0, visits: 0, daily: [], pages: [], refs: [], devices: [], countries: [] };

function Bars({ title, rows, total }: { title: string; rows: Row[]; total: number }) {
  return (
    <Card>
      <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">{title}</h2>
      {rows.length ? (
        <ul className="mt-4 space-y-2.5 text-sm">
          {rows.map((r) => (
            <li key={r.k}>
              <div className="flex justify-between gap-4">
                <span className="truncate">{r.k}</span>
                <span className="font-mono tabular-nums">{r.n}</span>
              </div>
              <div className="mt-1 h-1.5 bg-paper-2">
                <div className="h-full bg-flame" style={{ width: `${Math.max(2, (r.n / Math.max(1, total)) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-steel-text">No data yet.</p>
      )}
    </Card>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { supabase } = await requireStaff();
  const days = RANGES.includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 28;
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const [traffic, events, enquiries] = await Promise.all([
    supabase.rpc("admin_traffic", { p_since: since }),
    supabase.rpc("admin_event_counts", { p_since: since }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", since).neq("status", "spam"),
  ]);
  const t = (traffic.data as Traffic | null) ?? EMPTY;
  let clicks = 0;
  for (const e of (events.data ?? []) as { name: string; n: number }[]) if (e.name === "contact_click") clicks += Number(e.n);
  const enq = enquiries.count ?? 0;
  const rate = t.visits ? (((enq + clicks) / t.visits) * 100).toFixed(1) : "0.0";

  // Fill missing days so the chart has one bar per day.
  const byDay = new Map(t.daily.map((d) => [d.d, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() + 4 * 3600_000 - (days - 1 - i) * 86400_000).toISOString().slice(0, 10);
    return { d, views: byDay.get(d)?.views ?? 0 };
  });
  const max = Math.max(1, ...series.map((s) => s.views));

  return (
    <>
      <PageTitle title="Visitors & analytics">
        {RANGES.map((r) => (
          <Link key={r} href={`/admin/analytics?days=${r}`} aria-current={r === days ? "page" : undefined} className={`btn btn-sm ${r === days ? "btn-dark" : "btn-secondary"}`}>
            {r} days
          </Link>
        ))}
      </PageTitle>
      {traffic.error ? (
        <p role="alert" className="mb-6 border-s-4 border-danger bg-danger-bg px-4 py-3 text-sm">
          Visitor data could not be loaded. The analytics database update may not be applied yet.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Visits", t.visits, "Browser sessions started"],
          ["Page views", t.views, t.visits ? `${(t.views / t.visits).toFixed(1)} pages per visit` : "—"],
          ["Enquiries + contact clicks", enq + clicks, `${enq} enquiries · ${clicks} clicks`],
          ["Conversion", `${rate}%`, "Leads per visit"],
        ].map(([label, value, note]) => (
          <Card key={label as string}>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">{label}</p>
            <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
            <p className="mt-2 text-sm text-steel-text">{note}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text">Page views per day</h2>
        <div className="mt-5 flex h-44 items-end gap-[2px]" role="img" aria-label={`Page views per day over the last ${days} days, ${t.views} in total`}>
          {series.map((s) => (
            <div key={s.d} title={`${s.d}: ${s.views}`} className="flex-1 bg-flame/85 hover:bg-accent" style={{ height: `${Math.max(1.5, (s.views / max) * 100)}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-steel-text">
          <span>{series[0]?.d}</span>
          <span>peak {max}</span>
          <span>{series[series.length - 1]?.d}</span>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Bars title="Top pages" rows={t.pages} total={t.views} />
        <Bars title="Where visitors come from" rows={t.refs} total={t.visits} />
        <Bars title="Devices" rows={t.devices} total={t.visits} />
        <Bars title="Countries" rows={t.countries} total={t.visits} />
      </div>
      <p className="mt-6 max-w-[70ch] text-sm text-steel-text">
        Counted by the website itself with no cookies and no personal data. Counting starts from the day this page was added; search
        keywords are not available here — connect Google Search Console for those.
      </p>
    </>
  );
}
