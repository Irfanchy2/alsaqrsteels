"use client";

import { useEffect, useMemo, useState } from "react";
import { liveAnnouncements, readDesign, photoLayout, FLAG_IMAGE, type Announcement, type AnnouncementSettings, type Design, type LiveItem } from "@/lib/announcements";

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
  // The premium banner is a centred composition, so several messages take
  // turns (fading) instead of scrolling past together.
  const leadPremium = readDesign(items[0].design).style === "premium";
  const rotate = (leadPremium || settings.mode === "rotate") && items.length > 1;
  const current = rotate ? items[index % items.length] : items[0];
  const design = readDesign(current.design);
  const premium = design.style === "premium";

  useEffect(() => {
    if (!rotate || paused || hover) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), settings.interval * 1000);
    return () => window.clearTimeout(t);
  }, [rotate, paused, hover, index, items.length, settings.interval]);

  const scrolling = premium ? current.animation === "marquee" : rotate ? current.animation === "marquee" : items.length > 1 || current.animation === "marquee";
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
      className={`ann-bar relative z-50 flex h-[var(--ann-hm)] items-center overflow-hidden md:h-[var(--ann-h)] ${premium ? `ann-premium ann-${design.theme}` : ""}`}
      style={
        {
          "--ann-h": `${device === "mobile" ? current.height_mobile : current.height_desktop}px`,
          "--ann-hm": `${device === "desktop" ? current.height_desktop : current.height_mobile}px`,
          background: current.bg_color,
          color: current.text_color,
          fontSize: `${current.font_size}px`,
          "--ann-fs": `${current.font_size}px`,
          "--ann-sub": design.subtext_color,
        } as React.CSSProperties
      }
    >
      {premium ? <PremiumBackdrop design={design} bg={current.bg_color} /> : null}
      {premium && !scrolling ? (
        <PremiumContent key={current.id} item={current} design={design} device={device} />
      ) : scrolling ? (
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

// ---------------------------------------------------------------------------
// Premium celebration banner: deep emerald (or ivory) with a softly blurred
// UAE flag behind a centred headline, flag icons, a four-colour underline and
// a subtitle. All of it is set per announcement in the admin.

function PremiumBackdrop({ design, bg }: { design: Design; bg: string }) {
  const custom = design.image_url !== FLAG_IMAGE;
  const r = parseInt(bg.slice(1, 3), 16), g = parseInt(bg.slice(3, 5), 16), b = parseInt(bg.slice(5, 7), 16);
  const c = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
  return (
    <>
      <div
        aria-hidden="true"
        className="ann-flag pointer-events-none absolute -inset-3"
        style={
          {
            "--ann-img": `url("${design.image_url}")`,
            "--ann-img-sm": `url("${custom ? design.image_url : "/img/ann/uae-flag-banner-1200.webp"}")`,
            ...photoLayout(design),
            opacity: design.image_opacity / 100,
            filter: design.image_blur ? `blur(${design.image_blur}px)` : undefined,
          } as React.CSSProperties
        }
      />
      {/* Keeps the text readable: a soft pool of the background colour
          behind the centred text, so the flag shows fully at the sides. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 34% 140% at 50% 50%, ${c(0.62)} 0%, ${c(0.35)} 60%, ${c(0)} 100%)` }}
      />
    </>
  );
}

function PremiumContent({ item, design, device }: { item: LiveItem; design: Design; device?: "mobile" | "desktop" }) {
  const compact = design.size === "compact";
  const link = item.link_url;
  const external = link?.startsWith("https://") && !link.includes("alsaqrsteels.com");
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const heading = (
    <span className="ann-premium-head">
      {item.emoji ? <span aria-hidden="true" className="me-1.5">{item.emoji}</span> : null}
      {link && !item.cta_text ? (
        <a href={link} className="hover:underline focus-visible:underline" {...linkProps}>
          {item.text}
        </a>
      ) : (
        item.text
      )}
    </span>
  );
  const cta =
    link && item.cta_text ? (
      <a href={link} className="ann-premium-cta" {...linkProps}>
        {item.cta_text} →
      </a>
    ) : null;
  const sub = item.subtitleText ? <span className="ann-premium-sub">{item.subtitleText}</span> : null;

  return (
    <div className={`ann-premium-in relative flex h-full w-full items-center justify-center px-9 text-center ${compact ? "" : "flex-col"}`} data-device={device}>
      <p className="flex min-w-0 items-center justify-center gap-2.5">
        {design.flag_icons ? <FlagIcon /> : null}
        {heading}
        {compact && sub ? <span className="ann-premium-sep hidden md:inline">{sub}</span> : null}
        {compact ? cta : null}
        {design.flag_icons ? <FlagIcon /> : null}
      </p>
      {design.underline ? <Underline compact={compact} /> : null}
      {!compact && (sub || cta) ? (
        <p className="ann-premium-subline flex min-w-0 items-center justify-center gap-2">
          {sub}
          {cta}
        </p>
      ) : null}
    </div>
  );
}

// Small UAE flag, drawn (not an emoji, which some computers show as "AE").
function FlagIcon() {
  return (
    <svg viewBox="0 0 24 12" width="21" height="11" aria-hidden="true" className="ann-flag-icon flex-none">
      <rect width="24" height="4" y="0" fill="#00732f" />
      <rect width="24" height="4" y="4" fill="#ffffff" />
      <rect width="24" height="4" y="8" fill="#000000" />
      <rect width="6" height="12" fill="#ce1126" />
    </svg>
  );
}

// Red, white, black and green: a short underline in the flag's colours.
function Underline({ compact }: { compact: boolean }) {
  return (
    <span aria-hidden="true" className={`ann-underline flex ${compact ? "absolute bottom-[5px] left-1/2 -translate-x-1/2" : ""}`}>
      <i style={{ background: "#ce1126" }} />
      <i style={{ background: "#ffffff" }} />
      <i style={{ background: "#000000" }} />
      <i style={{ background: "#00732f" }} />
    </span>
  );
}
