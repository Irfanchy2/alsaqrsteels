"use client";

import { useEffect, useRef, useState } from "react";

type Snapshot = { title: string; slug: string; excerpt: string; html: string; metaTitle: string; metaDesc: string; image: string };
type Check = { ok: boolean; warn?: boolean; text: string };

const SITE = "alsaqrsteels.com";
const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const has = (hay: string, kw: string) => !!kw && hay.toLowerCase().includes(kw.toLowerCase());
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// Live SEO helper for a blog post: a Google-style preview and a checklist that
// updates as you type. It reads the surrounding form, so it works with every
// field (including the article editor) without changing how the post is saved.
export default function SeoPanel({ formId }: { formId: string }) {
  const [snap, setSnap] = useState<Snapshot>({ title: "", slug: "", excerpt: "", html: "", metaTitle: "", metaDesc: "", image: "" });
  const [keyword, setKeyword] = useState("");
  const last = useRef("");

  useEffect(() => {
    const read = () => {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (!form) return;
      const fd = new FormData(form);
      const v = (k: string) => String(fd.get(k) ?? "");
      const next = { title: v("title"), slug: v("slug"), excerpt: v("excerpt"), html: v("content"), metaTitle: v("meta_title"), metaDesc: v("meta_description"), image: v("image") };
      const key = JSON.stringify(next);
      if (key !== last.current) {
        last.current = key;
        setSnap(next);
      }
    };
    read();
    const t = window.setInterval(read, 700);
    return () => window.clearInterval(t);
  }, [formId]);

  const title = snap.metaTitle || snap.title;
  const desc = snap.metaDesc || snap.excerpt;
  const slug = snap.slug || slugify(snap.title);
  const text = plain(snap.html);
  const firstPara = plain(snap.html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const h2s = (snap.html.match(/<h2[\s>]/gi) ?? []).length;
  const internal = (snap.html.match(/href="\/(?!\/)/gi) ?? []).length;
  const imgs = snap.html.match(/<img[^>]*>/gi) ?? [];
  const imgsNoAlt = imgs.filter((t) => !/alt="[^"]+"/i.test(t)).length;
  const count = words(snap.html);
  const kw = keyword.trim();

  const checks: Check[] = [
    { ok: title.length >= 30 && title.length <= 60, warn: title.length > 0, text: `SEO title is ${title.length} characters (best 30–60).` },
    { ok: desc.length >= 120 && desc.length <= 160, warn: desc.length > 0, text: `Description is ${desc.length} characters (best 120–160).` },
    { ok: count >= 800, warn: count >= 400, text: `Article is ${count} words (aim for 800+ for guides).` },
    { ok: h2s >= 2, text: `${h2s} subheadings (H2). Use 2 or more to break up the article.` },
    { ok: internal >= 2, warn: internal === 1, text: `${internal} links to your own pages (aim for 2+: a service page and /quote).` },
    { ok: !!snap.image, text: snap.image ? "Cover photo added." : "Add a cover photo." },
    { ok: imgs.length > 0 && imgsNoAlt === 0, warn: imgs.length === 0, text: imgs.length ? `${imgs.length - imgsNoAlt} of ${imgs.length} photos in the article have a description.` : "No photos inside the article yet." },
  ];
  if (kw) {
    checks.unshift(
      { ok: has(title, kw), text: "Focus keyword is in the SEO title." },
      { ok: has(desc, kw), text: "Focus keyword is in the description." },
      { ok: has(firstPara, kw), text: "Focus keyword is in the first paragraph." },
      { ok: has(slug.replace(/-/g, " "), kw), warn: true, text: "Focus keyword is in the web address." },
      { ok: /<h2[^>]*>[^<]*/i.test(snap.html) && has((snap.html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) ?? []).join(" "), kw), warn: true, text: "Focus keyword is in a subheading." }
    );
  }
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const tone = score >= 80 ? "text-ok" : score >= 50 ? "text-warn" : "text-danger";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="seo-keyword" className="field-label">
          Focus keyword
        </label>
        <input
          id="seo-keyword"
          className="input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. steel shed Abu Dhabi"
        />
        <span className="field-hint">The phrase people type into Google that this post should rank for. Only used for the checks below.</span>
      </div>

      <div>
        <p className="field-label">Google preview</p>
        <div className="rounded-lg border border-line bg-white p-3">
          <p className="truncate text-xs text-[#4d5156]">
            {SITE} › blog › {slug || "your-post"}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[1.05rem] leading-snug text-[#1a0dab]">{title ? `${title} | Al Saqr Al Ahmar` : "Your post title"}</p>
          <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-snug text-[#4d5156]">{desc || "Your description appears here. Write one or two sentences that make people want to click."}</p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <p className="field-label !mb-0">SEO checklist</p>
          <p className={`text-lg font-bold tabular-nums ${tone}`}>{score}/100</p>
        </div>
        <ul className="mt-2 space-y-1.5 text-[0.8rem]">
          {checks.map((c) => (
            <li key={c.text} className="flex gap-2">
              <span aria-hidden="true" className={c.ok ? "text-ok" : c.warn ? "text-warn" : "text-danger"}>
                {c.ok ? "✓" : c.warn ? "!" : "✕"}
              </span>
              <span className={c.ok ? "text-steel-text" : ""}>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
