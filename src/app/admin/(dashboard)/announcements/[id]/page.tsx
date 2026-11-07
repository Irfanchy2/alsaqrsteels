import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";
import AnnouncementEditor, { type EditorValues } from "@/components/admin/AnnouncementEditor";
import { toDubaiInput, type Announcement } from "@/lib/announcements";

export const dynamic = "force-dynamic";

const BLANK: EditorValues = {
  id: null,
  title: "",
  message: "",
  emoji: "",
  link_url: "",
  cta_text: "",
  bg_color: "#111111",
  text_color: "#ffffff",
  font_size: 13,
  height_desktop: 30,
  height_mobile: 32,
  speed: 30,
  direction: "left",
  animation: "marquee",
  starts: "",
  ends: "",
  recurrence: "none",
  enabled: true,
  status: "draft",
  priority: 0,
  override_auto: false,
  kind: "custom",
  template_key: null,
};

const toValues = (a: Announcement): EditorValues => {
  const { starts_at, ends_at, ...rest } = a;
  return { ...rest, emoji: a.emoji ?? "", link_url: a.link_url ?? "", cta_text: a.cta_text ?? "", starts: toDubaiInput(starts_at), ends: toDubaiInput(ends_at) };
};

export default async function EditAnnouncement({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();

  if (id === "new") {
    // The UAE celebration templates can be used as a starting point.
    const { data } = await supabase.from("announcements").select("*").eq("kind", "celebration").order("title");
    const templates = ((data ?? []) as Announcement[]).map((t) => {
      const { id: _id, template_key: _k, status: _s, ...v } = toValues(t);
      return { label: `UAE: ${t.title}`, values: { ...v, kind: "custom" as const } };
    });
    return (
      <>
        <PageTitle title="New announcement" back={{ href: "/admin/announcements", label: "Announcement bar" }} />
        <Flash saved={saved} error={error} />
        <AnnouncementEditor initial={BLANK} templates={templates} />
      </>
    );
  }

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("announcements").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as Announcement;
  return (
    <>
      <PageTitle title={a.title} back={{ href: "/admin/announcements", label: "Announcement bar" }} />
      <Flash saved={saved} error={error} />
      {a.kind === "celebration" ? (
        <p className="mb-4 rounded-lg border border-line bg-card px-4 py-3 text-sm">
          This is a built-in UAE celebration. You can change everything.
          {a.template_key?.startsWith("eid") ? " Eid dates follow the moon: set this year's dates when they are announced, then publish." : null}
        </p>
      ) : null}
      <AnnouncementEditor key={a.id + (saved ?? "")} initial={toValues(a)} templates={[]} />
    </>
  );
}
