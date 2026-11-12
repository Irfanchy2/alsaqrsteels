// Announcement bar rules, shared by the website (which messages show now) and
// the admin (status of each announcement, live preview). Pure functions: no
// database or browser access, so the same answer comes out everywhere.
//
// All dates are UAE time (Asia/Dubai, UTC+4 all year, no daylight saving).

export type Announcement = {
  id: string;
  title: string;
  message: string;
  emoji: string | null;
  link_url: string | null;
  cta_text: string | null;
  bg_color: string;
  text_color: string;
  font_size: number;
  height_desktop: number;
  height_mobile: number;
  speed: number;
  direction: "left" | "right";
  animation: "marquee" | "fade" | "static";
  starts_at: string | null;
  ends_at: string | null;
  recurrence: "none" | "yearly";
  enabled: boolean;
  status: "draft" | "published";
  priority: number;
  override_auto: boolean;
  kind: "custom" | "celebration";
  template_key: string | null;
  /** Look of the bar: slim one-line bar, or the premium celebration banner. */
  design?: Partial<Design> | null;
};

// Premium celebration banner settings (stored in announcements.design).
export type Design = {
  style: "slim" | "premium";
  theme: "dark" | "light";
  size: "premium" | "compact";
  subtitle: string;
  subtext_color: string;
  image_url: string;
  /** Background photo opacity, 0-40 (%). */
  image_opacity: number;
  /** Background photo blur, 0-8 (px). */
  image_blur: number;
  flag_icons: boolean;
  underline: boolean;
};

export const FLAG_IMAGE = "/img/ann/uae-flag-banner-2400.webp";
export const THEMES = {
  dark: { bg: "#102b25", text: "#ffffff", sub: "#d0e2d7", opacity: 17 },
  light: { bg: "#f5f6f1", text: "#163c30", sub: "#526c61", opacity: 7 },
} as const;
export const SIZES = {
  premium: { desktop: 56, mobile: 48 },
  compact: { desktop: 40, mobile: 36 },
} as const;

export const DEFAULT_DESIGN: Design = {
  style: "slim",
  theme: "dark",
  size: "premium",
  subtitle: "",
  subtext_color: THEMES.dark.sub,
  image_url: FLAG_IMAGE,
  image_opacity: THEMES.dark.opacity,
  image_blur: 3,
  flag_icons: true,
  underline: true,
};

const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
const okImage = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 500 && ((v.startsWith("/") && !v.startsWith("//")) || /^https:\/\/[^\s"'()]+$/.test(v));

/** Design settings with every value checked and defaults filled in. */
export function readDesign(v: unknown): Design {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Design>;
  const theme = o.theme === "light" ? "light" : "dark";
  const num = (x: unknown, min: number, max: number, d: number) => (Number.isFinite(Number(x)) ? Math.min(max, Math.max(min, Number(x))) : d);
  return {
    style: o.style === "premium" ? "premium" : "slim",
    theme,
    size: o.size === "compact" ? "compact" : "premium",
    subtitle: typeof o.subtitle === "string" ? o.subtitle.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 160) : "",
    subtext_color: isHex(o.subtext_color) ? o.subtext_color : THEMES[theme].sub,
    image_url: okImage(o.image_url) ? o.image_url : FLAG_IMAGE,
    image_opacity: num(o.image_opacity, 0, 40, THEMES[theme].opacity),
    image_blur: num(o.image_blur, 0, 8, 3),
    flag_icons: o.flag_icons !== false,
    underline: o.underline !== false,
  };
}

export type AnnouncementSettings = { enabled: boolean; mode: "marquee" | "rotate"; interval: number };
export const DEFAULT_SETTINGS: AnnouncementSettings = { enabled: true, mode: "marquee", interval: 6 };

export function readSettings(v: unknown): AnnouncementSettings {
  const o = (v && typeof v === "object" ? v : {}) as Partial<AnnouncementSettings>;
  return {
    enabled: o.enabled !== false,
    mode: o.mode === "rotate" ? "rotate" : "marquee",
    interval: Math.min(60, Math.max(3, Number(o.interval) || DEFAULT_SETTINGS.interval)),
  };
}

const DUBAI_OFFSET = 4 * 3600_000;
const UAE_FOUNDED = 1971;

/** UAE-time calendar parts of an instant. */
function dubaiParts(ms: number) {
  const d = new Date(ms + DUBAI_OFFSET);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() };
}
/** Instant for a UAE-time date and time. */
function fromDubai(y: number, m: number, d: number, h: number, min: number) {
  return Date.UTC(y, m, d, h, min) - DUBAI_OFFSET;
}

/** "2026-12-02T09:30" (UAE time, for <input type="datetime-local">) from an ISO date. */
export function toDubaiInput(iso: string | null): string {
  if (!iso) return "";
  const p = dubaiParts(Date.parse(iso));
  const two = (n: number) => String(n).padStart(2, "0");
  return `${p.y}-${two(p.m + 1)}-${two(p.d)}T${two(p.h)}:${two(p.min)}`;
}
/** ISO date from a UAE-time "YYYY-MM-DDTHH:mm" value, or null if empty/invalid. */
export function fromDubaiInput(v: string | null | undefined): string | null {
  const m = (v ?? "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  return new Date(fromDubai(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])).toISOString();
}

export type Occurrence = { start: number | null; end: number | null };

/**
 * The window an announcement applies to around `now`. One-off: its own dates.
 * Yearly: the same UAE dates shifted to the year that is current or next
 * (the window may cross New Year, e.g. 31 Dec → 1 Jan).
 */
export function occurrence(a: Pick<Announcement, "starts_at" | "ends_at" | "recurrence">, now: number): Occurrence {
  const start = a.starts_at ? Date.parse(a.starts_at) : null;
  const end = a.ends_at ? Date.parse(a.ends_at) : null;
  if (a.recurrence !== "yearly" || start === null || end === null) return { start, end };
  const s = dubaiParts(start);
  const length = end - start;
  const year = dubaiParts(now).y;
  for (const y of [year - 1, year, year + 1]) {
    const st = fromDubai(y, s.m, s.d, s.h, s.min);
    if (now < st + length) return { start: st, end: st + length };
  }
  const st = fromDubai(year + 1, s.m, s.d, s.h, s.min);
  return { start: st, end: st + length };
}

export function isLive(a: Announcement, now: number): boolean {
  if (a.status !== "published" || !a.enabled) return false;
  const o = occurrence(a, now);
  return (o.start === null || now >= o.start) && (o.end === null || now < o.end);
}

export type AdminStatus = "active" | "scheduled" | "expired" | "draft" | "disabled";
export function adminStatus(a: Announcement, now: number): AdminStatus {
  if (a.status === "draft") return "draft";
  if (!a.enabled) return "disabled";
  const o = occurrence(a, now);
  if (o.start !== null && now < o.start) return "scheduled";
  if (o.end !== null && now >= o.end) return "expired";
  return "active";
}

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

/**
 * Message with its placeholders filled for the occurrence:
 * {year} = UAE-time year the occasion ends in, {anniversary} = "55th" etc.
 */
export function fillMessage(a: Pick<Announcement, "message" | "starts_at" | "ends_at" | "recurrence">, now: number): string {
  const o = occurrence(a, now);
  const year = dubaiParts(o.end ?? o.start ?? now).y;
  return a.message.replace(/\{year\}/g, String(year)).replace(/\{anniversary\}/g, ordinal(year - UAE_FOUNDED));
}

export type LiveItem = Announcement & { text: string; subtitleText: string };

/**
 * What the bar shows now, highest priority first. If any live announcement
 * has "Override automatic announcements" on, the automatic UAE celebration
 * messages are left out.
 */
export function liveAnnouncements(rows: Announcement[], settings: AnnouncementSettings, now: number): LiveItem[] {
  if (!settings.enabled) return [];
  let live = rows.filter((a) => isLive(a, now));
  if (live.some((a) => a.override_auto)) live = live.filter((a) => a.kind !== "celebration");
  return live
    .sort((a, b) => b.priority - a.priority || (Date.parse(b.starts_at ?? "0") || 0) - (Date.parse(a.starts_at ?? "0") || 0))
    .map((a) => ({ ...a, text: fillMessage(a, now), subtitleText: fillMessage({ ...a, message: readDesign(a.design).subtitle }, now) }));
}
