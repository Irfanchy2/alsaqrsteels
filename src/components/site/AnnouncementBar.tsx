"use client";

import { useEffect, useMemo, useState } from "react";
import { liveAnnouncements, type Announcement, type AnnouncementSettings, type LiveItem } from "@/lib/announcements";

// The slim bar above the site header. The server sends every announcement
// that could show; this decides, from the clock, which ones are live now
// (re-checked every 30 s), so messages start and expire on time. Two modes:
// one continuous scroll of all messages, or one message at a time.
// Pauses on hover/focus and with the pause button; no motion for visitors
// who ask for reduced motion.
export default function AnnouncementBar({
  rows,
  settings,
  serverNow,
  previewItems,
  device,
}: {
  rows: Announcement[];
  settings: AnnouncementSettings;
  serverNow: number;
  /** Admin preview: show these as they are, ignoring dates. */
  previewItems?: LiveItem[];
  /** Admin preview: force the phone or desktop height. */
  device?: "mobile" | "desktop";
}) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    if (previewItems) return;
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, [previewItems]);

  const items = useMemo(() => previewItems ?? liveAnnouncements(rows, settings, now), [previewItems, rows, settings, now]);
  if (!items.length) return null;
  return <Bar key={items.map((i) => i.id).join()} items={items} settings={settings} device={device} />;
}

function Bar({ items, settings, device }: { items: LiveItem[]; settings: AnnouncementSettings; device?: "mobile" | "desktop" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const rotate = settings.mode === "rotate" && items.length > 1;
  const current = rotate ? items[index % items.length] : items[0];

  useEffect(() => {
    if (!rotate || paused || hover) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), settings.interval * 1000);
    return () => window.clearTimeout(t);
  }, [rotate, paused, hover, index, items.length, settings.interval]);

  const scrolling = rotate ? current.animation === "marquee" : items.length > 1 || current.animation === "marquee";
  const moving = scrolling || rotate;

  return (
    <div
      role="region"
      aria-label="Announcements"
      data-paused={paused || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="ann-bar relative z-50 flex h-[var(--ann-hm)] items-center overflow-hidden md:h-[var(--ann-h)]"
      style={
        {
          "--ann-h": `${device === "mobile" ? current.height_mobile : current.height_desktop}px`,
          "--ann-hm": `${device === "desktop" ? current.height_desktop : current.height_mobile}px`,
          background: current.bg_color,
          color: current.text_color,
          fontSize: `${current.font_size}px`,
        } as React.CSSProperties
      }
    >
      {scrolling ? (
        <Marquee items={rotate ? [current] : items} lead={current} />
      ) : (
        <p
          key={current.id}
          className={`w-full truncate px-10 text-center leading-none ${current.animation === "fade" || rotate ? "ann-fade" : ""}`}
        >
          <Message item={current} />
        </p>
      )}
      {moving ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play announcements" : "Pause announcements"}
          aria-pressed={paused}
          className="absolute end-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full opacity-70 hover:opacity-100 focus-visible:opacity-100"
          style={{ background: current.bg_color, color: current.text_color }}
        >
          {paused ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 1l7 4-7 4z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}

// One message: optional emoji, the text, and the link (as its own call to
// action, or the whole message when there is no CTA text).
function Message({ item, hidden = false }: { item: LiveItem; hidden?: boolean }) {
  const tab = hidden ? -1 : undefined;
  const external = item.link_url?.startsWith("https://") && !item.link_url.includes("alsaqrsteels.com");
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const body = (
    <>
      {item.emoji ? <span aria-hidden="true" className="me-1.5">{item.emoji}</span> : null}
      {item.text}
    </>
  );
  if (!item.link_url) return body;
  if (!item.cta_text)
    return (
      <a href={item.link_url} tabIndex={tab} className="hover:underline focus-visible:underline" {...linkProps}>
        {body}
      </a>
    );
  return (
    <>
      {body}
      <a href={item.link_url} tabIndex={tab} className="ms-2 font-semibold underline underline-offset-2" {...linkProps}>
        {item.cta_text} →
      </a>
    </>
  );
}

// A seamless loop: the messages are repeated until one copy is wider than a
// big screen, and two copies slide by half their width.
function Marquee({ items, lead }: { items: LiveItem[]; lead: LiveItem }) {
  const chars = items.reduce((n, i) => n + i.text.length + (i.cta_text?.length ?? 0) + 8, 0);
  const repeat = Math.max(1, Math.ceil(2200 / Math.max(1, chars * lead.font_size * 0.55)));
  const copy = (hidden: boolean) => (
    <ul className="flex flex-none items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: repeat }).flatMap((_, r) =>
        items.map((it) => (
          <li key={`${r}-${it.id}`} className="flex items-center whitespace-nowrap px-6">
            <Message item={it} hidden={hidden || r > 0} />
            <span aria-hidden="true" className="ms-12 opacity-50">
              ✦
            </span>
          </li>
        ))
      )}
    </ul>
  );
  return (
    <div className="ann-viewport h-full w-full overflow-hidden">
      <div
        className="ann-track flex h-full w-max items-center"
        style={{ "--ann-dur": `${lead.speed * repeat}s`, animationDirection: lead.direction === "right" ? "reverse" : "normal" } as React.CSSProperties}
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
