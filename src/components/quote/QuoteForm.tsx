"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateQuoteFields, formatBytes, SERVICE_OTHER } from "@/lib/quote-client";
import { UPLOAD_LIMITS } from "@/lib/site";
import { track } from "@/lib/track";
import { HANDOFF_KEY } from "@/lib/assistant";

type ServiceOption = { slug: string; title: string };
type Values = {
  name: string;
  company: string;
  phone: string;
  email: string;
  service: string;
  location: string;
  scope: string;
  dimensions: string;
  quantities: string;
  targetDate: string;
  consent: boolean;
};
type Attachment = {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  path?: string;
  error?: string;
};

const EMPTY: Values = {
  name: "",
  company: "",
  phone: "",
  email: "",
  service: "",
  location: "",
  scope: "",
  dimensions: "",
  quantities: "",
  targetDate: "",
  consent: false,
};

const DRAFT_KEY = "asq-quote-draft";

const FIELD_ORDER = ["name", "contact", "phone", "email", "service", "location", "scope", "dimensions", "quantities", "targetDate", "files", "consent", "form"];

function uploadWithProgress(url: string, file: File, onProgress: (p: number) => void, isMock: boolean) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (!isMock) {
      xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
      xhr.setRequestHeader("x-upsert", "false");
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    const fd = new FormData();
    fd.append("cacheControl", "3600");
    fd.append("", file);
    xhr.send(fd);
  });
}

export default function QuoteForm({
  services,
  phone,
  whatsapp,
}: {
  services: ServiceOption[];
  phone: { display: string; e164: string } | null;
  whatsapp: string | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Attachment[]>([]);
  const [state, setState] = useState<"idle" | "submitting" | "failed">("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [fromAssistant, setFromAssistant] = useState(false);
  const [session] = useState(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : ""));
  const startedAt = useRef(Date.now());
  const summaryRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const trackedStart = useRef(false);

  // Prefill: ?service=, ?topic=, assistant hand-off, or a saved draft.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    let next: Values = { ...EMPTY };
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) next = { ...next, ...JSON.parse(draft), consent: false };
    } catch {}
    const svc = q.get("service");
    if (svc && (services.some((s) => s.slug === svc) || svc === SERVICE_OTHER)) next.service = svc;
    if (q.get("topic") === "certificates" && !next.scope) {
      next.service = SERVICE_OTHER;
      next.scope = "Request for current certification documents (please list the certificates your tender or registration requires): ";
    }
    try {
      const handoff = sessionStorage.getItem(HANDOFF_KEY);
      if (handoff) {
        const h = JSON.parse(handoff) as Partial<Values>;
        next = {
          ...next,
          name: h.name ?? next.name,
          company: h.company ?? next.company,
          service: h.service && (services.some((s) => s.slug === h.service) || h.service === SERVICE_OTHER) ? h.service : next.service,
          location: h.location ?? next.location,
          scope: h.scope ?? next.scope,
          dimensions: h.dimensions ?? next.dimensions,
          quantities: h.quantities ?? next.quantities,
          targetDate: h.targetDate ?? next.targetDate,
        };
        if (!("source" in h) || (h as { source?: string }).source !== "quick-start") setFromAssistant(true);
        sessionStorage.removeItem(HANDOFF_KEY);
      }
    } catch {}
    setValues(next);
  }, [services]);

  // Save a draft of the text fields (never files, never consent).
  useEffect(() => {
    const { consent: _c, ...rest } = values;
    void _c;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {}
  }, [values]);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [key]: v }));
    if (!trackedStart.current) {
      trackedStart.current = true;
      track({ name: "quote_start", props: { service: values.service || undefined } });
    }
    if (errors[key] || (errors.contact && (key === "phone" || key === "email"))) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        if (key === "phone" || key === "email") delete n.contact;
        return n;
      });
    }
  };

  const totalBytes = useMemo(() => files.reduce((sum, f) => sum + f.file.size, 0), [files]);
  const uploading = files.some((f) => f.status === "uploading");

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    const problems: string[] = [];
    let running = totalBytes;
    const accepted: Attachment[] = [];
    for (const file of incoming) {
      const lower = file.name.toLowerCase();
      const typeOk =
        (UPLOAD_LIMITS.types as readonly string[]).includes(file.type) &&
        [".pdf", ".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext));
      if (!typeOk) problems.push(`“${file.name}” is not a PDF, JPG or PNG.`);
      else if (file.size > UPLOAD_LIMITS.maxFileBytes) problems.push(`“${file.name}” is ${formatBytes(file.size)}; the limit is 10 MB per file.`);
      else if (files.length + accepted.length >= UPLOAD_LIMITS.maxFiles) problems.push(`Only ${UPLOAD_LIMITS.maxFiles} files can be attached.`);
      else if (running + file.size > UPLOAD_LIMITS.maxTotalBytes) problems.push(`“${file.name}” would take the total over 25 MB.`);
      else {
        running += file.size;
        accepted.push({ id: crypto.randomUUID(), file, status: "uploading", progress: 0 });
      }
    }
    setErrors((prev) => {
      const n = { ...prev };
      if (problems.length) n.files = Array.from(new Set(problems)).join(" ");
      else delete n.files;
      return n;
    });
    if (!accepted.length) return;
    setFiles((prev) => [...prev, ...accepted]);
    for (const a of accepted) void startUpload(a);
  }

  async function startUpload(a: Attachment) {
    const update = (patch: Partial<Attachment>) => setFiles((prev) => prev.map((f) => (f.id === a.id ? { ...f, ...patch } : f)));
    update({ status: "uploading", progress: 0, error: undefined });
    try {
      const res = await fetch("/api/quote/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, fileName: a.file.name, size: a.file.size, type: a.file.type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "The upload service is unavailable.");
      await uploadWithProgress(data.signedUrl, a.file, (p) => update({ progress: p }), !!data.mock);
      update({ status: "done", progress: 1, path: data.path });
    } catch (err) {
      update({ status: "error", error: err instanceof Error ? err.message : "Upload failed." });
    }
  }

  function removeFile(id: string) {
    // Removing from the list is enough: only listed files are submitted, and
    // unsubmitted uploads are never linked to an enquiry.
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setFailure(null);
    const website = (new FormData(e.currentTarget).get("website") as string) || "";

    const errs = validateQuoteFields(values as Record<string, unknown>);
    if (uploading) errs.files = "Please wait for your files to finish uploading.";
    if (files.some((f) => f.status === "error")) errs.files = "Remove or retry the files that failed to upload.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setState("submitting");
    try {
      const res = await fetch("/api/quote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: files.length ? session : undefined,
          files: files.filter((f) => f.status === "done" && f.path).map((f) => ({ path: f.path, name: f.file.name })),
          fields: { ...values, source: fromAssistant ? "assistant" : "quote_form" },
          pagePath: window.location.pathname,
          website,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.reference === "string") {
        try {
          sessionStorage.removeItem(DRAFT_KEY);
          sessionStorage.setItem(
            "asq-last-enquiry",
            JSON.stringify({ reference: data.reference, files: files.length, at: Date.now() })
          );
        } catch {}
        router.push(`/quote/submitted?ref=${encodeURIComponent(data.reference)}`);
        return;
      }
      if (res.status === 422 && data.fields) {
        setErrors(data.fields);
        setState("idle");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setFailure(
        data.message ??
          "We couldn't send your request. Nothing was saved. Please try again, or call or WhatsApp us."
      );
      setState("failed");
      requestAnimationFrame(() => failureRef.current?.focus());
    } catch {
      setFailure("Your connection dropped before the request reached us. Nothing was saved. Please try again.");
      setState("failed");
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  }

  const errorList = FIELD_ORDER.filter((k) => errors[k]).map((k) => [k, errors[k]] as const);
  const fieldTarget: Record<string, string> = { contact: "q-phone", form: "q-name" };
  const invalid = (k: string) => (errors[k] ? true : undefined);
  const describe = (k: string, hint?: boolean) =>
    [hint ? `q-${k}-hint` : null, errors[k] ? `q-${k}-err` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8" aria-describedby="q-required-note">
      {fromAssistant ? (
        <div className="border-s-4 border-accent bg-card p-4 text-[0.95rem]">
          We&apos;ve filled in the summary from the Project Assistant. Please check every field and add your contact
          details — nothing is sent until you press <strong>Send request</strong>.
        </div>
      ) : null}

      {errorList.length ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-2 border-danger bg-danger-bg p-5 outline-none">
          <p className="font-semibold text-danger">Please correct {errorList.length === 1 ? "this" : "these"} before sending:</p>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {errorList.map(([k, msg]) => (
              <li key={k}>
                <a href={`#${fieldTarget[k] ?? `q-${k}`}`} className="underline underline-offset-2">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {failure ? (
        <div ref={failureRef} tabIndex={-1} role="alert" className="border-2 border-danger bg-danger-bg p-5 outline-none">
          <p className="font-semibold text-danger">Request not sent</p>
          <p className="mt-1">{failure}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary btn-sm">
              Try again
            </button>
            {phone ? (
              <a href={`tel:${phone.e164}`} className="btn btn-secondary btn-sm">
                Call {phone.display}
              </a>
            ) : null}
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                WhatsApp
              </a>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-steel-text">Your answers are still here, so you won&apos;t need to retype them.</p>
        </div>
      ) : null}

      <p id="q-required-note" className="text-sm text-steel-text">
        Fields marked <span aria-hidden="true" className="text-accent">*</span>
        <span className="sr-only">with an asterisk</span> are required. Give a phone number, an email address, or both.
      </p>

      {/* Contact ---------------------------------------------------------- */}
      <fieldset className="space-y-5">
        <legend className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">1 · Your details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="q-name" className="field-label">
              Name <span className="text-accent" aria-hidden="true">*</span>
            </label>
            <input id="q-name" className="input" autoComplete="name" required value={values.name} onChange={set("name")} aria-invalid={invalid("name")} aria-describedby={describe("name")} />
            {errors.name ? <span id="q-name-err" className="field-error">{errors.name}</span> : null}
          </div>
          <div>
            <label htmlFor="q-company" className="field-label">
              Company <span className="font-normal text-steel-text">(optional)</span>
            </label>
            <input id="q-company" className="input" autoComplete="organization" value={values.company} onChange={set("company")} aria-invalid={invalid("company")} />
          </div>
          <div>
            <label htmlFor="q-phone" className="field-label">
              Phone or WhatsApp
            </label>
            <input id="q-phone" className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="+971 50 123 4567" value={values.phone} onChange={set("phone")} aria-invalid={invalid("phone") || invalid("contact")} aria-describedby={[describe("phone"), errors.contact ? "q-contact-err" : null].filter(Boolean).join(" ") || undefined} />
            {errors.phone ? <span id="q-phone-err" className="field-error">{errors.phone}</span> : null}
          </div>
          <div>
            <label htmlFor="q-email" className="field-label">
              Email
            </label>
            <input id="q-email" className="input" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set("email")} aria-invalid={invalid("email") || invalid("contact")} aria-describedby={[describe("email"), errors.contact ? "q-contact-err" : null].filter(Boolean).join(" ") || undefined} />
            {errors.email ? <span id="q-email-err" className="field-error">{errors.email}</span> : null}
          </div>
        </div>
        {errors.contact ? <span id="q-contact-err" className="field-error">{errors.contact}</span> : null}
      </fieldset>

      {/* Project ---------------------------------------------------------- */}
      <fieldset className="space-y-5">
        <legend className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">2 · Your project</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="q-service" className="field-label">
              Service <span className="text-accent" aria-hidden="true">*</span>
            </label>
            <select id="q-service" className="input" required value={values.service} onChange={set("service")} aria-invalid={invalid("service")} aria-describedby={describe("service")}>
              <option value="">Choose a service…</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
              <option value={SERVICE_OTHER}>Other / not sure</option>
            </select>
            {errors.service ? <span id="q-service-err" className="field-error">{errors.service}</span> : null}
          </div>
          <div>
            <label htmlFor="q-location" className="field-label">
              Project location <span className="text-accent" aria-hidden="true">*</span>
            </label>
            <input id="q-location" className="input" placeholder="e.g. ICAD, Abu Dhabi" value={values.location} onChange={set("location")} aria-invalid={invalid("location")} aria-describedby={describe("location")} />
            {errors.location ? <span id="q-location-err" className="field-error">{errors.location}</span> : null}
          </div>
        </div>
        <div>
          <label htmlFor="q-scope" className="field-label">
            Scope of work <span className="text-accent" aria-hidden="true">*</span>
          </label>
          <textarea
            id="q-scope"
            className="input"
            rows={6}
            maxLength={5000}
            placeholder="What needs fabricating or installing, materials or finishes if known, and anything about site access."
            value={values.scope}
            onChange={set("scope")}
            aria-invalid={invalid("scope")}
            aria-describedby={describe("scope", true)}
          />
          <span id="q-scope-hint" className="field-hint">
            {values.scope.length.toLocaleString()} / 5,000 characters
          </span>
          {errors.scope ? <span id="q-scope-err" className="field-error">{errors.scope}</span> : null}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="q-dimensions" className="field-label">
              Dimensions <span className="font-normal text-steel-text">(optional)</span>
            </label>
            <input id="q-dimensions" className="input" value={values.dimensions} onChange={set("dimensions")} aria-invalid={invalid("dimensions")} />
          </div>
          <div>
            <label htmlFor="q-quantities" className="field-label">
              Quantities <span className="font-normal text-steel-text">(optional)</span>
            </label>
            <input id="q-quantities" className="input" value={values.quantities} onChange={set("quantities")} aria-invalid={invalid("quantities")} />
          </div>
          <div>
            <label htmlFor="q-targetDate" className="field-label">
              Target date <span className="font-normal text-steel-text">(optional)</span>
            </label>
            <input id="q-targetDate" className="input" type="date" value={values.targetDate} onChange={set("targetDate")} aria-invalid={invalid("targetDate")} aria-describedby={describe("targetDate")} />
            {errors.targetDate ? <span id="q-targetDate-err" className="field-error">{errors.targetDate}</span> : null}
          </div>
        </div>
      </fieldset>

      {/* Files ------------------------------------------------------------ */}
      <fieldset className="space-y-4">
        <legend className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-steel-text">
          3 · Drawings, BOQ or photos <span className="normal-case tracking-normal">(optional)</span>
        </legend>
        <div
          className="border-2 border-dashed border-line-strong bg-card p-6 text-center transition-colors focus-within:border-ink"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-ink");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("border-ink")}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-ink");
            void addFiles(e.dataTransfer.files);
          }}
        >
          <label htmlFor="q-files" className="btn btn-secondary btn-sm cursor-pointer">
            Choose files
          </label>
          <input
            id="q-files"
            type="file"
            multiple
            accept={UPLOAD_LIMITS.accept}
            className="sr-only"
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
            aria-describedby="q-files-hint"
          />
          <p id="q-files-hint" className="mt-3 text-sm text-steel-text">
            or drag them here · PDF, JPG or PNG · up to 5 files, 10 MB each, 25 MB in total
          </p>
        </div>
        {errors.files ? <span id="q-files-err" className="field-error" role="alert">{errors.files}</span> : null}
        {files.length ? (
          <ul className="divide-y divide-line border border-line bg-card" aria-label="Attached files">
            {files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{f.file.name}</p>
                  <p className="text-sm text-steel-text">
                    {formatBytes(f.file.size)} ·{" "}
                    {f.status === "uploading" ? (
                      <span>Uploading {Math.round(f.progress * 100)}%</span>
                    ) : f.status === "done" ? (
                      <span className="text-ok">Uploaded</span>
                    ) : (
                      <span className="text-danger">{f.error}</span>
                    )}
                  </p>
                  {f.status === "uploading" ? (
                    <div className="mt-2 h-1 bg-paper-2" aria-hidden="true">
                      <div className="h-1 bg-flame transition-[width]" style={{ width: `${Math.max(4, f.progress * 100)}%` }} />
                    </div>
                  ) : null}
                </div>
                {f.status === "error" ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => void startUpload(f)}>
                    Retry
                  </button>
                ) : null}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-sm text-steel-text">
          Files are stored privately and are only accessible to authorised Al Saqr Al Ahmar staff.
        </p>
      </fieldset>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="q-website">Website</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="border-t-2 border-ink pt-6">
        <label className="flex items-start gap-3">
          <input
            id="q-consent"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            checked={values.consent}
            onChange={set("consent")}
            aria-invalid={invalid("consent")}
            aria-describedby={describe("consent")}
          />
          <span className="text-[0.95rem]">
            I agree that Al Saqr Al Ahmar may use these details and files to respond to my enquiry, as described in the{" "}
            <a href="/privacy" className="underline underline-offset-2" target="_blank">
              privacy notice
            </a>
            . <span className="text-accent" aria-hidden="true">*</span>
          </span>
        </label>
        {errors.consent ? <span id="q-consent-err" className="field-error">{errors.consent}</span> : null}
        {errors.form ? <span className="field-error">{errors.form}</span> : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary min-w-48" disabled={state === "submitting"} aria-describedby="q-submit-note">
            {state === "submitting" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                Sending…
              </>
            ) : uploading ? (
              "Waiting for uploads…"
            ) : (
              "Send request"
            )}
          </button>
          <p id="q-submit-note" className="text-sm text-steel-text" aria-live="polite">
            {state === "submitting" ? "Saving your request — please keep this page open." : "You'll receive a reference number once it's saved."}
          </p>
        </div>
      </div>
    </form>
  );
}
