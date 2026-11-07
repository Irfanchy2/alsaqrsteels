"use client";

import { useState } from "react";
import { aiDraftBlogPost } from "@/app/admin/actions";

// "Write a draft with AI": fills the post's fields with a draft to check and
// edit. Nothing is saved or published until the person presses Save.
export default function AiWriterPanel({ enabled, formId }: { enabled: boolean; formId: string }) {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  if (!enabled) {
    return (
      <div className="text-sm">
        <p className="text-steel-text">
          The AI writer is ready but not switched on. It works with <strong>free</strong> AI services such as OpenRouter (free Hermes, Llama
          and other models), Groq or Google AI Studio. Add these three settings in Hostinger (your website → Node.js → Environment variables),
          then redeploy:
        </p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          <li>AI_BASE_URL</li>
          <li>AI_API_KEY</li>
          <li>AI_WRITER_MODEL</li>
        </ul>
        <p className="mt-2 text-steel-text">Step-by-step guide and costs: docs/AI-WRITER-PLAN.md in the project.</p>
      </div>
    );
  }

  async function run() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    const filled = form && ["title", "excerpt"].some((n) => String(new FormData(form).get(n) ?? "").trim());
    if (filled && !window.confirm("Replace the title, summary, article and SEO fields with an AI draft?")) return;
    setBusy(true);
    setMsg(null);
    const res = await aiDraftBlogPost({ topic, keyword, notes });
    setBusy(false);
    if (!res.ok) return setMsg({ kind: "error", text: res.error });
    const d = res.draft;
    const set = (name: string, value: string) => {
      const el = form?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    set("title", d.title);
    set("slug", d.slug);
    set("excerpt", d.excerpt);
    set("meta_title", d.meta_title);
    set("meta_description", d.meta_description);
    set("tags", d.tags);
    window.dispatchEvent(new CustomEvent("rte:set", { detail: { name: "content", html: d.content_html } }));
    setMsg({ kind: "ok", text: "Draft added. Read it carefully, fix anything that isn't right for your company, add photos, then Save." });
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="ai-topic" className="field-label">
          What should the article be about?
        </label>
        <input id="ai-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How to choose a car parking shade for a villa" />
      </div>
      <div>
        <label htmlFor="ai-keyword" className="field-label">
          Focus keyword
        </label>
        <input id="ai-keyword" className="input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. car parking shade Abu Dhabi" />
      </div>
      <div>
        <label htmlFor="ai-notes" className="field-label">
          Notes (optional)
        </label>
        <textarea
          id="ai-notes"
          className="input !min-h-20"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Points to include, a recent job to mention, things to avoid…"
        />
      </div>
      <button type="button" className="btn btn-primary btn-sm w-full" onClick={() => void run()} disabled={busy || topic.trim().length < 5}>
        {busy ? "Writing… (about a minute)" : "✨ Write a draft"}
      </button>
      {msg ? <p className={msg.kind === "ok" ? "text-sm font-medium text-ok" : "field-error"}>{msg.text}</p> : null}
      <p className="text-xs text-steel-text">The AI only drafts. It doesn&apos;t know your prices or projects, so always check before publishing.</p>
    </div>
  );
}
