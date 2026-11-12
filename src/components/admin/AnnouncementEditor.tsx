"use client";

import { useMemo, useState } from "react";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import { fillMessage, fromDubaiInput, readDesign, FLAG_IMAGE, SIZES, THEMES, type Announcement, type Design, type LiveItem } from "@/lib/announcements";
import MediaUpload from "@/components/admin/MediaUpload";
import { saveAnnouncement } from "@/app/admin/actions";

export type EditorValues = Omit<Announcement, "id" | "starts_at" | "ends_at" | "design"> & { id: string | null; starts: string; ends: string; design: Design };

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

  const setD = <K extends keyof Design>(k: K, value: Design[K]) => setV((p) => ({ ...p, design: { ...p.design, [k]: value } }));
  const itemFor = (vals: EditorValues): LiveItem => {
    const a = { ...vals, id: "preview", starts_at: fromDubaiInput(vals.starts), ends_at: fromDubaiInput(vals.ends) } as Announcement;
    return {
      ...a,
      text: fillMessage({ ...a, message: vals.message || "Your message appears here" }, now),
      subtitleText: fillMessage({ ...a, message: vals.design.subtitle }, now),
    };
  };
  const previewItem = useMemo(() => itemFor(v), [v, now]); // eslint-disable-line react-hooks/exhaustive-deps
  const premium = v.design.style === "premium";
  // The same banner in the other theme, for the side-by-side comparison.
  const themed = (theme: Design["theme"]): LiveItem =>
    itemFor({
      ...v,
      bg_color: THEMES[theme].bg,
      text_color: THEMES[theme].text,
      design: { ...v.design, theme, subtext_color: THEMES[theme].sub, image_opacity: THEMES[theme].opacity },
    });
  const applyTheme = (theme: Design["theme"]) =>
    setV((p) => ({
      ...p,
      bg_color: THEMES[theme].bg,
      text_color: THEMES[theme].text,
      design: { ...p.design, theme, subtext_color: THEMES[theme].sub, image_opacity: THEMES[theme].opacity },
    }));
  const applySize = (size: Design["size"]) =>
    setV((p) => ({ ...p, height_desktop: SIZES[size].desktop, height_mobile: SIZES[size].mobile, design: { ...p.design, size } }));
  const applyStyle = (style: Design["style"]) =>
    setV((p) =>
      style === "premium"
        ? {
            ...p,
            font_size: Math.max(p.font_size, 15),
            animation: p.animation === "marquee" ? "fade" : p.animation,
            height_desktop: SIZES[p.design.size].desktop,
            height_mobile: SIZES[p.design.size].mobile,
            bg_color: THEMES[p.design.theme].bg,
            text_color: THEMES[p.design.theme].text,
            design: { ...p.design, style, subtext_color: THEMES[p.design.theme].sub },
          }
        : { ...p, font_size: 13, height_desktop: 30, height_mobile: 32, design: { ...p.design, style } }
    );
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

      <input type="hidden" name="design" value={JSON.stringify(v.design)} />

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
        {premium ? (
          <>
            <p className="mb-1 mt-4 text-xs text-steel-text">Dark and light side by side (click one to use it)</p>
            <div className="grid gap-3 lg:grid-cols-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTheme(t)}
                  className={`overflow-hidden rounded-lg border-2 text-left ${v.design.theme === t ? "border-[#005bd3]" : "border-line hover:border-steel"}`}
                  aria-pressed={v.design.theme === t}
                >
                  <span className="pointer-events-none block">
                    <AnnouncementBar rows={[]} settings={settings} serverNow={now} previewItems={[themed(t)]} device="desktop" />
                  </span>
                  <span className="block bg-white px-3 py-1.5 text-xs font-medium">{t === "dark" ? "Dark premium" : "Light premium"}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        <p className="mt-3 text-xs text-steel-text">The preview ignores the dates. Hover over the bar to pause it, as visitors can.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-line bg-card p-5">
        <p className="font-semibold">Style</p>
        <Segmented
          name="_style"
          value={v.design.style}
          onChange={(x) => applyStyle(x as Design["style"])}
          options={[
            ["premium", "Premium celebration banner"],
            ["slim", "Slim bar"],
          ]}
        />
        {premium ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="field-label">Theme</p>
                <Segmented name="_theme" value={v.design.theme} onChange={(x) => applyTheme(x as Design["theme"])} options={[["dark", "Dark"], ["light", "Light"]]} />
              </div>
              <div>
                <p className="field-label">Size</p>
                <Segmented
                  name="_size"
                  value={v.design.size}
                  onChange={(x) => applySize(x as Design["size"])}
                  options={[
                    ["premium", "Premium (56 / 48 px)"],
                    ["compact", "Compact (40 / 36 px)"],
                  ]}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ann-subtitle" className="field-label">
                Subtitle
              </label>
              <input
                id="ann-subtitle"
                className="input"
                maxLength={160}
                value={v.design.subtitle}
                onChange={(e) => setD("subtitle", e.target.value)}
                placeholder="Celebrating the Spirit of the Union · Al Saqr Steels"
              />
              <span className="field-hint">The smaller second line. The main message above is the headline.</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="field-label">Background photo</p>
                <MediaUpload
                  key={v.design.image_url === FLAG_IMAGE ? "flag" : "custom"}
                  name="_image"
                  folder="announcements"
                  defaultUrl={v.design.image_url === FLAG_IMAGE ? null : v.design.image_url}
                  label="Upload a different photo"
                  maxMb={5}
                  onChange={(url) => setD("image_url", url || FLAG_IMAGE)}
                />
                <span className="field-hint">
                  {v.design.image_url === FLAG_IMAGE ? "Using the built-in UAE flag." : "Using your photo. "}
                  {v.design.image_url !== FLAG_IMAGE ? (
                    <button type="button" className="underline" onClick={() => setD("image_url", FLAG_IMAGE)}>
                      Use the UAE flag again
                    </button>
                  ) : null}
                </span>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="field-label">Photo visibility: {v.design.image_opacity}%</span>
                  <input type="range" min={0} max={40} value={v.design.image_opacity} onChange={(e) => setD("image_opacity", Number(e.target.value))} className="w-full" />
                </label>
                <label className="block">
                  <span className="field-label">Photo blur: {v.design.image_blur}px</span>
                  <input type="range" min={0} max={8} value={v.design.image_blur} onChange={(e) => setD("image_blur", Number(e.target.value))} className="w-full" />
                </label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="field-label">Photo size</p>
                  <Segmented
                    name="_fit"
                    value={v.design.image_fit}
                    onChange={(x) => setD("image_fit", x as Design["image_fit"])}
                    options={[
                      ["cover", "Fill the banner"],
                      ["contain", "Show the whole photo"],
                    ]}
                  />
                  <span className="field-hint">
                    “Fill” stretches the photo across the banner and crops it, best for wide photos. For a small or square photo, choose
                    “Show the whole photo”.
                  </span>
                </div>
                <div>
                  <p className="field-label">Photo position</p>
                  <Segmented
                    name="_pos"
                    value={v.design.image_position}
                    onChange={(x) => setD("image_position", x as Design["image_position"])}
                    options={[
                      ["left", "Left"],
                      ["center", "Centre"],
                      ["right", "Right"],
                    ]}
                  />
                </div>
              </div>
              {v.design.image_fit === "contain" ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="field-label">Photo zoom: {v.design.image_zoom}%</span>
                    <input type="range" min={50} max={300} step={5} value={v.design.image_zoom} onChange={(e) => setD("image_zoom", Number(e.target.value))} className="w-full" />
                    <span className="field-hint">100% = the photo is exactly as tall as the banner.</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={v.design.image_repeat} onChange={(e) => setD("image_repeat", e.target.checked)} className="h-5 w-5" />
                    <span className="font-medium">Repeat the photo across the banner</span>
                  </label>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={v.design.flag_icons} onChange={(e) => setD("flag_icons", e.target.checked)} className="h-5 w-5" />
                <span className="font-medium">Small UAE flags beside the headline</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={v.design.underline} onChange={(e) => setD("underline", e.target.checked)} className="h-5 w-5" />
                <span className="font-medium">Red, white, black and green underline</span>
              </label>
            </div>
          </div>
        ) : null}
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
              {premium ? (
                <div className="sm:col-span-2">
                  <label htmlFor="ann-subcolor" className="field-label">
                    Subtitle colour
                  </label>
                  <div className="flex gap-2">
                    <input type="color" aria-label="Pick subtitle colour" value={v.design.subtext_color} onChange={(e) => setD("subtext_color", e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-0.5" />
                    <input id="ann-subcolor" className="input font-mono" value={v.design.subtext_color} onChange={(e) => setD("subtext_color", e.target.value)} pattern="#[0-9a-fA-F]{6}" />
                  </div>
                </div>
              ) : null}
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
                <input id="ann-hd" className="input" {...num("height_desktop", 24, 72)} />
              </div>
              <div>
                <label htmlFor="ann-hm" className="field-label">
                  Height: phone
                </label>
                <input id="ann-hm" className="input" {...num("height_mobile", 24, 72)} />
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
                <Segmented name="animation" value={v.animation} onChange={(x) => set("animation", x as EditorValues["animation"])} options={[["fade", "Fade in"], ["static", "Still"], ["marquee", "Scrolling"]]} />
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
