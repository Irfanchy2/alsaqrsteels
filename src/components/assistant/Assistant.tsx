"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/track";
import { CONTACT_PATTERN, ASSISTANT_LIMITS, HANDOFF_KEY, type ChatMessage, type EnquirySummary } from "@/lib/assistant";

type ServiceOption = { slug: string; title: string };
type Availability = "unknown" | "available" | "offline";

const CONSENT_KEY = "asq-assistant-consent";
const HISTORY_KEY = "asq-assistant-history";
const STARTERS = [
  "Which service fits my project?",
  "Show me your oil and gas projects",
  "Help me prepare a quote request",
];

// Renders [label](/path) as internal links; everything else as plain text.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)\s]*\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\((\/[^)\s]*)\)$/);
        if (m) {
          return (
            <Link key={i} href={m[2]} className="font-semibold underline decoration-accent decoration-2 underline-offset-2">
              {m[1]}
            </Link>
          );
        }
        return (
          <Fragment key={i}>
            {part.split("\n").map((line, j, arr) => (
              <Fragment key={j}>
                {line.replace(/\*\*(.+?)\*\*/g, "$1")}
                {j < arr.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

export default function Assistant({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const [availability, setAvailability] = useState<Availability>("unknown");
  const [consent, setConsent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmContact, setConfirmContact] = useState(false);
  const [summary, setSummary] = useState<EnquirySummary | null>(null);

  useEffect(() => {
    try {
      setConsent(sessionStorage.getItem(CONSENT_KEY) === "yes");
      const h = sessionStorage.getItem(HISTORY_KEY);
      if (h) setMessages(JSON.parse(h));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-ASSISTANT_LIMITS.maxMessages)));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, summary, pending]);

  async function open() {
    dialog.current?.showModal();
    track({ name: "assistant_open" });
    if (availability === "unknown") {
      try {
        const res = await fetch("/api/assistant", { cache: "no-store" });
        const data = await res.json();
        setAvailability(data.available ? "available" : "offline");
      } catch {
        setAvailability("offline");
      }
    }
  }

  async function send(text: string, skipContactCheck = false) {
    const content = text.trim();
    if (!content || pending) return;
    if (content.length > ASSISTANT_LIMITS.maxUserChars) {
      setError("Please keep messages under 1,000 characters.");
      return;
    }
    if (!skipContactCheck && CONTACT_PATTERN.test(content)) {
      setConfirmContact(true);
      return;
    }
    setConfirmContact(false);
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true, messages: next.slice(-ASSISTANT_LIMITS.maxMessages) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 503) setAvailability("offline");
        setError(data.message ?? "The assistant couldn't answer just now.");
        setMessages(messages); // roll back so the visitor can retry
        setInput(content);
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.summary) setSummary(data.summary);
    } catch {
      setError("Connection problem — your message wasn't sent. Please try again.");
      setMessages(messages);
      setInput(content);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function handoff() {
    if (!summary) return;
    try {
      sessionStorage.setItem(
        HANDOFF_KEY,
        JSON.stringify({
          service: summary.service,
          location: summary.location,
          scope: [summary.scope, summary.openQuestions.length ? `\n\nStill to confirm: ${summary.openQuestions.join("; ")}` : ""]
            .join("")
            .slice(0, 5000),
          dimensions: summary.dimensions,
          quantities: summary.quantities,
          targetDate: summary.targetDate,
        })
      );
    } catch {}
    track({ name: "assistant_handoff", props: { service: summary.service || undefined } });
    dialog.current?.close();
    router.push("/quote");
  }

  function resetChat() {
    setMessages([]);
    setSummary(null);
    setError(null);
    try {
      sessionStorage.removeItem(HISTORY_KEY);
    } catch {}
  }

  const setS = (k: keyof EnquirySummary) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setSummary((s) => (s ? { ...s, [k]: e.target.value } : s));

  return (
    <>
      <button
        type="button"
        onClick={open}
        data-no-print
        className="fixed bottom-[4.75rem] end-4 z-30 inline-flex min-h-12 items-center gap-2 border border-ink bg-paper px-4 text-sm font-semibold shadow-lg transition-colors hover:bg-ink hover:text-paper lg:bottom-6 lg:end-6"
        aria-haspopup="dialog"
      >
        <span className="bg-ink px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wider text-paper" aria-hidden="true">
          AI
        </span>
        Project Assistant
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        className="m-0 ms-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 text-ink shadow-2xl sm:border-s sm:border-ink"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-3 border-b-2 border-ink px-5 py-4">
            <div>
              <h2 id={`${id}-title`} className="flex items-center gap-2 text-lg font-bold">
                Al Saqr Project Assistant
                <span className="bg-ink px-1.5 py-0.5 font-mono text-[0.65rem] font-medium tracking-wider text-paper">AI</span>
              </h2>
              <p className="mt-0.5 text-sm text-steel-text">Automated assistant — not a member of staff</p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line-strong"
              onClick={() => dialog.current?.close()}
              aria-label="Close assistant"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
            <div className="border-s-4 border-accent bg-card p-4 text-sm">
              I can answer questions about our services and projects, and help you prepare a quote request.{" "}
              <strong>I can&apos;t give prices, delivery dates or engineering decisions</strong> — our team confirms those
              in writing.
            </div>

            {availability === "offline" ? (
              <div className="border-2 border-ink bg-card p-4" role="status">
                <p className="font-semibold">The assistant is offline at the moment.</p>
                <p className="mt-1 text-sm text-steel-text">You can still reach our team directly:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/quote" className="btn btn-primary btn-sm" onClick={() => dialog.current?.close()}>
                    Quote form
                  </Link>
                  <Link href="/contact" className="btn btn-secondary btn-sm" onClick={() => dialog.current?.close()}>
                    Call or WhatsApp
                  </Link>
                </div>
              </div>
            ) : null}

            {availability !== "offline" && !consent ? (
              <div className="border-2 border-ink bg-card p-4">
                <p className="text-sm">
                  Your messages are processed by our AI provider (Anthropic) to generate replies. Please don&apos;t
                  include personal details or confidential documents — you&apos;ll add contact details and drawings on
                  the quote form. See our{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    privacy notice
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm mt-3"
                  onClick={() => {
                    setConsent(true);
                    try {
                      sessionStorage.setItem(CONSENT_KEY, "yes");
                    } catch {}
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                >
                  I understand — start chat
                </button>
              </div>
            ) : null}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[88%] px-4 py-3 text-[0.95rem] leading-relaxed ${
                    m.role === "user" ? "bg-ink text-on-ink" : "border border-line bg-card"
                  }`}
                >
                  <span className="sr-only">{m.role === "user" ? "You said: " : "Assistant: "}</span>
                  <RichText text={m.content} />
                </div>
              </div>
            ))}

            {pending ? (
              <p className="flex items-center gap-2 text-sm text-steel-text" role="status">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-accent" aria-hidden="true" />
                Assistant is typing…
              </p>
            ) : null}

            {summary ? (
              <section aria-labelledby={`${id}-sum`} className="border-2 border-ink bg-card">
                <h3 id={`${id}-sum`} className="border-b border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em]">
                  Enquiry summary — edit before sending
                </h3>
                <div className="space-y-3 p-4">
                  <div>
                    <label htmlFor={`${id}-svc`} className="field-label !text-sm">Service</label>
                    <select id={`${id}-svc`} className="input !min-h-10 !py-2" value={summary.service} onChange={setS("service")}>
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                      <option value="other">Other / not sure</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`${id}-loc`} className="field-label !text-sm">Location</label>
                    <input id={`${id}-loc`} className="input !min-h-10 !py-2" value={summary.location} onChange={setS("location")} />
                  </div>
                  <div>
                    <label htmlFor={`${id}-scope`} className="field-label !text-sm">Scope</label>
                    <textarea id={`${id}-scope`} className="input !min-h-28" rows={5} value={summary.scope} onChange={setS("scope")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${id}-dim`} className="field-label !text-sm">Dimensions</label>
                      <input id={`${id}-dim`} className="input !min-h-10 !py-2" value={summary.dimensions} onChange={setS("dimensions")} />
                    </div>
                    <div>
                      <label htmlFor={`${id}-qty`} className="field-label !text-sm">Quantities</label>
                      <input id={`${id}-qty`} className="input !min-h-10 !py-2" value={summary.quantities} onChange={setS("quantities")} />
                    </div>
                  </div>
                  {summary.openQuestions.length ? (
                    <div className="text-sm">
                      <p className="font-semibold">Our team will also need:</p>
                      <ul className="mt-1 list-disc ps-5 text-steel-text">
                        {summary.openQuestions.map((q) => (
                          <li key={q}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="button" className="btn btn-primary btn-sm" onClick={handoff}>
                      Continue to quote form
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSummary(null)}>
                      Keep chatting
                    </button>
                  </div>
                  <p className="text-xs text-steel-text">
                    Nothing is sent to our team until you submit the quote form with your contact details.
                  </p>
                </div>
              </section>
            ) : null}

            {consent && availability !== "offline" && messages.length === 0 ? (
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel-text">Try asking</p>
                <ul className="mt-2 space-y-2">
                  {STARTERS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className="w-full border border-line-strong bg-card px-4 py-2.5 text-left text-sm hover:border-ink"
                        onClick={() => void send(s)}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <footer className="border-t-2 border-ink p-4">
            {error ? (
              <p role="alert" className="mb-3 border-s-4 border-danger bg-danger-bg px-3 py-2 text-sm">
                {error}{" "}
                <Link href="/quote" className="underline" onClick={() => dialog.current?.close()}>
                  Use the quote form
                </Link>
              </p>
            ) : null}
            {confirmContact ? (
              <div role="alert" className="mb-3 border-s-4 border-warn bg-warn-bg p-3 text-sm">
                <p>
                  Your message looks like it contains a phone number or email. You don&apos;t need to share contact details
                  here — you&apos;ll add them on the quote form.
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmContact(false)}>
                    Edit message
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => void send(input, true)}>
                    Send anyway
                  </button>
                </div>
              </div>
            ) : null}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor={`${id}-input`} className="sr-only">
                Message the assistant
              </label>
              <textarea
                id={`${id}-input`}
                ref={inputRef}
                className="input !min-h-12 flex-1 resize-none"
                rows={2}
                maxLength={ASSISTANT_LIMITS.maxUserChars}
                placeholder={consent ? "Ask about services or describe your project…" : "Start the chat above first"}
                value={input}
                disabled={!consent || availability === "offline" || pending}
                onChange={(e) => {
                  setInput(e.target.value);
                  setConfirmContact(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm !min-h-12" disabled={!consent || availability === "offline" || pending || !input.trim()}>
                Send
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-xs text-steel-text">
              <span>AI replies can be wrong. Our team confirms all details.</span>
              {messages.length ? (
                <button type="button" className="underline" onClick={resetChat}>
                  Clear chat
                </button>
              ) : null}
            </div>
          </footer>
        </div>
      </dialog>
    </>
  );
}
