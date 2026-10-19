"use client";

import { useEffect, useRef, useState } from "react";

// A small article editor for staff: headings, bold/italic, lists, quotes and
// links, with an "HTML" view for anyone who prefers source. The result goes
// into a hidden input; the server cleans it (src/lib/html.ts) before saving,
// so text pasted from Word or Google Docs is safe.
const TOOLS: { label: string; title: string; run: () => void; wide?: boolean }[] = [
  { label: "P", title: "Paragraph", run: () => document.execCommand("formatBlock", false, "p") },
  { label: "H2", title: "Heading", run: () => document.execCommand("formatBlock", false, "h2") },
  { label: "H3", title: "Sub-heading", run: () => document.execCommand("formatBlock", false, "h3") },
  { label: "B", title: "Bold", run: () => document.execCommand("bold") },
  { label: "I", title: "Italic", run: () => document.execCommand("italic") },
  { label: "• List", title: "Bulleted list", run: () => document.execCommand("insertUnorderedList"), wide: true },
  { label: "1. List", title: "Numbered list", run: () => document.execCommand("insertOrderedList"), wide: true },
  { label: "❝", title: "Quote", run: () => document.execCommand("formatBlock", false, "blockquote") },
  {
    label: "Link",
    title: "Add link to selected text",
    wide: true,
    run: () => {
      const url = window.prompt("Link address (https://…)");
      if (url && /^(https?:\/\/|mailto:|tel:|\/)/i.test(url.trim())) document.execCommand("createLink", false, url.trim());
    },
  },
  { label: "Unlink", title: "Remove link", run: () => document.execCommand("unlink"), wide: true },
  { label: "Clear", title: "Clear formatting", run: () => document.execCommand("removeFormat"), wide: true },
];

export default function RichTextEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (ref.current && !source) ref.current.innerHTML = html;
    // Only when switching back from the HTML view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    setWords(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
  }, [html]);

  const sync = () => setHtml(ref.current?.innerHTML ?? "");

  return (
    <div className="border-[1.5px] border-line-strong bg-white focus-within:border-ink">
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-1 border-b border-line bg-paper-2 p-1.5 lg:top-0" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            disabled={source}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              ref.current?.focus();
              t.run();
              sync();
            }}
            className={`h-9 ${t.wide ? "px-2.5" : "w-9"} border border-transparent font-mono text-xs font-semibold hover:border-line hover:bg-white disabled:opacity-40`}
          >
            {t.label}
          </button>
        ))}
        <span className="ms-auto flex items-center gap-3 pe-1">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-steel-text">
            {words} words · {Math.max(1, Math.round(words / 220))} min
          </span>
          <button
            type="button"
            onClick={() => {
              if (!source) sync();
              setSource((v) => !v);
            }}
            className="h-9 border border-line bg-white px-2.5 font-mono text-xs font-semibold"
          >
            {source ? "Visual" : "HTML"}
          </button>
        </span>
      </div>
      {source ? (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          aria-label="Article HTML"
          className="block min-h-[26rem] w-full resize-y p-4 font-mono text-[13px] leading-relaxed outline-none"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Article"
          onInput={sync}
          onBlur={sync}
          className="prose article min-h-[26rem] max-w-none p-4 text-base outline-none sm:p-6"
        />
      )}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
