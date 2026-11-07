import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { adminStatus, fillMessage, occurrence, readSettings, type AdminStatus, type Announcement } from "@/lib/announcements";
import { announcementQuickAction, saveAnnouncementSettings } from "../../actions";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Showing now" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Drafts" },
  { key: "expired", label: "Expired" },
  { key: "disabled", label: "Switched off" },
];
const TONE: Record<AdminStatus, string> = {
  active: "bg-ok-bg text-ok",
  scheduled: "bg-[#e0ecff] text-[#004299]",
  draft: "bg-paper-2 text-ink",
  expired: "bg-paper-2 text-steel-text",
  disabled: "bg-warn-bg text-warn",
};
const LABEL: Record<AdminStatus, string> = { active: "Showing now", scheduled: "Scheduled", draft: "Draft", expired: "Expired", disabled: "Switched off" };

const dubai = (ms: number | null) =>
  ms === null
    ? null
    : new Date(ms).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; tab?: string }> }) {
  const { saved, error, tab = "all" } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: rows, error: loadError }, { data: settingsRow }] = await Promise.all([
    supabase.from("announcements").select("*").order("priority", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("site_content").select("data").eq("key", "announcement:settings").maybeSingle(),
  ]);
  const settings = readSettings(settingsRow?.data);
  const now = Date.now();
  const all = ((rows ?? []) as Announcement[]).map((a) => ({ a, status: adminStatus(a, now), occ: occurrence(a, now) }));
  const counts = Object.fromEntries(TABS.map((t) => [t.key, t.key === "all" ? all.length : all.filter((x) => x.status === t.key).length]));
  const list = tab === "all" ? all : all.filter((x) => x.status === tab);

  return (
    <>
      <PageTitle title="Announcement bar">
        <Link href="/admin/announcements/new" className="btn btn-primary btn-sm">
          + New announcement
        </Link>
      </PageTitle>
      <Flash saved={saved} error={error} />
      {loadError ? (
        <p className="mb-6 rounded-lg border border-warn/40 bg-warn-bg px-4 py-3 text-sm">
          The announcements table is not set up in the database yet ({loadError.message}). Run the migration
          supabase/migrations/20261107090000_announcements.sql in Supabase, then reload this page.
        </p>
      ) : null}

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <p className="font-semibold">Showing on the website now</p>
          <p className="mb-3 text-sm text-steel-text">Exactly what visitors see at the top of every page (UAE time).</p>
          <div className="overflow-hidden rounded-lg border border-line">
            <AnnouncementBar rows={(rows ?? []) as Announcement[]} settings={settings} serverNow={now} />
            <div className="flex h-10 items-center justify-center bg-[#0c0d10] text-xs text-white/50">website header</div>
          </div>
          {!settings.enabled ? <p className="mt-3 text-sm font-medium text-warn">The bar is switched off for the whole website.</p> : null}
        </Card>

        <Card>
          <form action={saveAnnouncementSettings} className="space-y-4">
            <p className="font-semibold">Bar settings</p>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-5 w-5" />
              <span className="font-medium">Show the announcement bar</span>
            </label>
            <fieldset>
              <legend className="field-label">When several messages are live</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" value="marquee" defaultChecked={settings.mode === "marquee"} /> Scroll them all in one line
              </label>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input type="radio" name="mode" value="rotate" defaultChecked={settings.mode === "rotate"} /> Show one at a time
              </label>
            </fieldset>
            <div>
              <label htmlFor="ann-interval" className="field-label">
                Seconds per message (one at a time)
              </label>
              <input id="ann-interval" type="number" name="interval" min={3} max={60} defaultValue={settings.interval} className="input" />
            </div>
            <button className="btn btn-primary btn-sm">Save settings</button>
          </form>
        </Card>
      </div>

      <nav aria-label="Filter announcements" className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/announcements" : `/admin/announcements?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.key ? "bg-[#303030] text-white" : "bg-card text-ink hover:bg-black/5"}`}
          >
            {t.label} <span className="opacity-60">{counts[t.key]}</span>
          </Link>
        ))}
      </nav>

      <ul className="divide-y divide-line rounded-xl border border-line bg-card">
        {list.map(({ a, status, occ }) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <span aria-hidden="true" className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-lg" style={{ background: a.bg_color, color: a.text_color }}>
              {a.emoji || "📢"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/announcements/${a.id}`} className="font-semibold hover:underline">
                  {a.title}
                </Link>
                <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${TONE[status]}`}>{LABEL[status]}</span>
                {a.kind === "celebration" ? <span className="rounded-lg bg-[#e6f4ea] px-2 py-0.5 text-xs text-[#00732f]">UAE celebration</span> : null}
                {a.override_auto ? <span className="rounded-lg bg-[#fff1e8] px-2 py-0.5 text-xs text-[#c2410c]">Overrides automatic</span> : null}
                {a.recurrence === "yearly" ? <span className="text-xs text-steel-text">↻ every year</span> : null}
              </p>
              <p className="truncate text-sm text-steel-text">{fillMessage(a, now)}</p>
              <p className="text-xs text-steel-text">
                {occ.start || occ.end ? `${dubai(occ.start) ?? "now"} → ${dubai(occ.end) ?? "until switched off"}` : a.kind === "celebration" && a.status === "draft" ? "Set this year's dates, then publish" : "No dates: shows until switched off"}
                {` · priority ${a.priority}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={`/admin/announcements/${a.id}`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <form action={announcementQuickAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="op" value={a.status === "published" ? "unpublish" : "publish"} />
                <button className="btn btn-secondary btn-sm">{a.status === "published" ? "Unpublish" : "Publish"}</button>
              </form>
              <form action={announcementQuickAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="op" value={a.enabled ? "disable" : "enable"} />
                <button className="btn btn-secondary btn-sm">{a.enabled ? "Switch off" : "Switch on"}</button>
              </form>
              <form action={announcementQuickAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="op" value="duplicate" />
                <button className="btn btn-secondary btn-sm">Duplicate</button>
              </form>
              <form action={announcementQuickAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="op" value="delete" />
                <ConfirmButton message={`Delete "${a.title}"? This cannot be undone.`} className="btn btn-sm text-danger hover:bg-danger-bg">
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </li>
        ))}
        {!list.length ? <li className="px-4 py-8 text-center text-sm text-steel-text">No announcements here.</li> : null}
      </ul>
    </>
  );
}
