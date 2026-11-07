"use client";

import { useMemo, useState } from "react";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import { fillMessage, fromDubaiInput, type Announcement, type LiveItem } from "@/lib/announcements";
import { saveAnnouncement } from "@/app/admin/actions";

export type EditorValues = Omit<Announcement, "id" | "starts_at" | "ends_at"> & { id: string | null; starts: string; ends: string };

const PRESETS: { label: string; values: Partial<EditorValues> }[] = [
  { label: "Accepting new projects", values: { title: "Accepting new projects", emoji: "🚧", message: "We are now accepting new steel fabrication projects. Contact us for a quotation.", link_url: "/quote", cta_text: "Get a quote", bg_color: "#ff5a1f", text_color: "#0a0a0a" } },
  { label: "Office closed", values: { title: "Office closed", emoji: "📢", message: "Our office will remain closed on December 2 and 3.", animation: "static", bg_color: "#111111", text_color: "#ffffff" } },
  { label: "Service update", values: { title: "Service update", emoji: "🔧", message: "New: in-house CNC laser cutting for faster turnaround.", link_url: "/services", cta_text: "See services", bg_color: "#1f2937", text_color: "#ffffff" } },
];

// Editor for one announcement, with a live preview of the bar on a computer
// and on a phone. Dates are UAE time. Save as a draft (not shown) or publish.
export default function AnnouncementEditor({ initial, templates }: { initial: EditorValues; templates: { label: string; values: Partial<EditorValues> }[] }) {
  const [v, setV] = useState<EditorValues>(initial);
  const set = <K extends keyof EditorValues>(k: K, value: EditorValues[K]) => setV((p) => ({ ...p, [k]: value }));
  const now = useMemo(() => Date.now(), []);

  const previewItem: LiveItem = useMemo(() => {
    const a = { ...v, id: "preview", starts_at: fromDubaiInput(v.starts), ends_at: fromDubaiInput(v.ends) } as Announcement;
    return { ...a, text: fillMessage({ ...a, message: v.message || "Your message appears here" }, now) };
  }, [v, now]);
  const settings = { enabled: true, mode: "marquee" as const, interval: 6 };
  const starters = [...templates, ...PRESETS];

  const text = (k: "title" | "message" | "emoji" | "link_url" | "cta_text") => ({
    value: (v[k] as string | null) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
    name: k,
  });
  const num = (k: "font_size" | "height_desktop" | "height_mobile" | "speed" | "priority", min: number, max: number) => ({
    type: "number",
    min,
    max,
    name: k,
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value)),
  });

  return (
    <form action={saveAnnouncement} className="space-y-6">
      {v.id ? <input type="hidden" name="id" value={v.id} /> : null}

      {/* Live preview */}
      <div className="rounded-xl border border-line bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Live preview</p>
        <p className="mb-1 text-xs text-steel-text">Computer</p>
        <div className="overflow-hidden rounded-lg border border-line">
          <AnnouncementBar rows={[]} settings={settings} serverNow={now} previewItems={[previewItem]} device="desktop" />
          <div className="h-10 bg-[#0c0d10]" />
        </div>
        <p className="mb-1 mt-4 text-xs text-steel-text">Phone</p>
        <div className="w-[375px] max-w-full overflow-hidden rounded-lg border border-line">
          <AnnouncementBar rows={[]} settings={settings} serverNow={now} previewItems={[previewItem]} device="mobile" />
          <div className="h-10 bg-[#0c0d10]" />
        </div>
        <p className="mt-3 text-xs text-steel-text">The preview ignores the dates. Hover over the bar to pause it, as visitors can.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {!v.id ? (
            <div className="rounded-xl border border-line bg-card p-5">
              <label htmlFor="ann-start" className="field-label">
                Start from
              </label>
              <select
                id="ann-start"
                className="input"
                defaultValue=""
                onChange={(e) => {
                  const s = starters[Number(e.target.value)];
                  if (s) setV((p) => ({ ...p, ...s.values }));
                }}
              >
                <option value="">A blank announcement</option>
                {starters.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="field-hint">Fills in the message and colours. Everything stays editable.</span>
            </div>
          ) : null}

          <div className="space-y-4 rounded-xl border border-line bg-card p-5">
            <p className="font-semibold">Message</p>
            <div>
              <label htmlFor="ann-title" className="field-label">
                Title <span className="font-normal text-steel-text">(only you see this)</span>
              </label>
              <input id="ann-title" className="input" required maxLength={120} {...text("title")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
              <div>
                <label htmlFor="ann-emoji" className="field-label">
                  Emoji
                </label>
                <input id="ann-emoji" className="input text-center" maxLength={8} placeholder="🇦🇪" {...text("emoji")} />
              </div>
              <div>
                <label htmlFor="ann-message" className="field-label">
                  Message
                </label>
                <textarea id="ann-message" className="input !min-h-20" rows={2} required maxLength={300} {...text("message")} />
              </div>
            </div>
            <p className="field-hint !mt-0">
              Tip: <code>{"{year}"}</code> becomes the year and <code>{"{anniversary}"}</code> becomes e.g. “55th” (years since 1971), so the
              National Day message updates itself every year.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ann-link" className="field-label">
                  Link (optional)
                </label>
                <input id="ann-link" className="input" placeholder="/quote or https://…" maxLength={500} list="ann-links" {...text("link_url")} />
                <datalist id="ann-links">
                  {["/quote", "/contact", "/services", "/projects", "/blog", "/about"].map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="ann-cta" className="field-label">
                  Button text (optional)
                </label>
                <input id="ann-cta" className="input" placeholder="Get a quote" maxLength={40} {...text("cta_text")} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-line bg-card p-5">
            <p className="font-semibold">Look and motion</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["bg_color", "text_color"] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={`ann-${k}`} className="field-label">
                    {k === "bg_color" ? "Background colour" : "Text colour"}
                  </label>
                  <div className="flex gap-2">
                    <input type="color" aria-label={k === "bg_color" ? "Pick background colour" : "Pick text colour"} value={v[k]} onChange={(e) => set(k, e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-0.5" />
                    <input id={`ann-${k}`} name={k} className="input font-mono" value={v[k]} onChange={(e) => set(k, e.target.value)} pattern="#[0-9a-fA-F]{6}" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="ann-font" className="field-label">
                  Text size (px)
                </label>
                <input id="ann-font" className="input" {...num("font_size", 10, 18)} />
              </div>
              <div>
                <label htmlFor="ann-hd" className="field-label">
                  Height: computer
                </label>
                <input id="ann-hd" className="input" {...num("height_desktop", 24, 56)} />
              </div>
              <div>
                <label htmlFor="ann-hm" className="field-label">
                  Height: phone
                </label>
                <input id="ann-hm" className="input" {...num("height_mobile", 24, 56)} />
              </div>
              <div>
                <label htmlFor="ann-speed" className="field-label">
                  Scroll time (s)
                </label>
                <input id="ann-speed" className="input" {...num("speed", 8, 120)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="field-label">Animation</p>
                <Segmented name="animation" value={v.animation} onChange={(x) => set("animation", x as EditorValues["animation"])} options={[["marquee", "Scrolling"], ["fade", "Fade in"], ["static", "Still"]]} />
              </div>
              <div>
                <p className="field-label">Scroll direction</p>
                <Segmented name="direction" value={v.direction} onChange={(x) => set("direction", x as EditorValues["direction"])} options={[["left", "← Left"], ["right", "Right →"]]} />
              </div>
            </div>
            <p className="field-hint !mt-0">Lower scroll time = faster. Default height is 30 px on computers and 32 px on phones.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-line bg-card p-5">
            <p className="font-semibold">When it shows (UAE time)</p>
            <div>
              <label htmlFor="ann-starts" className="field-label">
                Start
              </label>
              <input id="ann-starts" type="datetime-local" name="starts_at" className="input" value={v.starts} onChange={(e) => set("starts", e.target.value)} />
            </div>
            <div>
              <label htmlFor="ann-ends" className="field-label">
                End
              </label>
              <input id="ann-ends" type="datetime-local" name="ends_at" className="input" value={v.ends} onChange={(e) => set("ends", e.target.value)} />
              <span className="field-hint">Leave both empty to show it until you switch it off. It disappears by itself after the end.</span>
            </div>
            <div>
              <p className="field-label">Repeat</p>
              <Segmented name="recurrence" value={v.recurrence} onChange={(x) => set("recurrence", x as EditorValues["recurrence"])} options={[["none", "Once"], ["yearly", "Every year"]]} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-line bg-card p-5">
            <p className="font-semibold">Priority</p>
            <div>
              <label htmlFor="ann-priority" className="field-label">
                Priority (−100 to 100)
              </label>
              <input id="ann-priority" className="input" {...num("priority", -100, 100)} />
              <span className="field-hint">Higher shows first when several are live.</span>
            </div>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="override_auto" checked={v.override_auto} onChange={(e) => set("override_auto", e.target.checked)} className="mt-1 h-5 w-5" />
              <span>
                <span className="font-medium">Override automatic announcements</span>
                <span className="block text-sm text-steel-text">While this is live, the automatic UAE celebration messages are hidden.</span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="enabled" checked={v.enabled} onChange={(e) => set("enabled", e.target.checked)} className="mt-1 h-5 w-5" />
              <span>
                <span className="font-medium">Switched on</span>
                <span className="block text-sm text-steel-text">Untick to hide it without deleting it.</span>
              </span>
            </label>
          </div>

          <div className="space-y-2 rounded-xl border border-line bg-card p-5">
            <p className="text-sm text-steel-text">
              Currently: <strong>{initial.status === "published" ? "Published" : "Draft"}</strong>
            </p>
            <button type="submit" name="intent" value="publish" className="btn btn-primary w-full">
              {initial.status === "published" ? "Save and keep published" : "Publish"}
            </button>
            <button type="submit" name="intent" value="draft" className="btn btn-secondary w-full">
              {initial.status === "published" ? "Unpublish (save as draft)" : "Save as draft"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Segmented({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      <input type="hidden" name={name} value={value} />
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          role="radio"
          aria-checked={value === val}
          onClick={() => onChange(val)}
          className={`rounded-lg border px-3 py-1.5 text-sm ${value === val ? "border-[#303030] bg-[#303030] text-white" : "border-line bg-white hover:border-steel"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
