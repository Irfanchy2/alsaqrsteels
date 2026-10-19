// Supabase Edge Function: submit-enquiry
//
// The only code path that writes enquiries or touches the private
// `enquiry-files` bucket. Called server-to-server by the Next.js app
// (src/app/api/quote/*), authenticated with a shared secret stored in
// public.app_config (readable only with the service role).
//
// Actions
//   upload-url  -> signed upload URL for one attachment (browser uploads direct)
//   submit      -> validate fields + files, save enquiry, move files, notify
//   notify      -> retry the staff notification for an existing enquiry
//
// Deploy: supabase functions deploy submit-enquiry --no-verify-jwt
// (verify_jwt is off because the function implements its own secret check;
//  it is never called from the browser.)

import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "enquiry-files";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};
const SERVICES = [
  "steel-structures",
  "pipeline-welding",
  "laser-cnc-cutting",
  "storage-containers",
  "stainless-steel",
  "other",
];

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Config = Record<string, string | null>;
let configCache: { at: number; value: Config } | null = null;

async function getConfig(): Promise<Config> {
  if (configCache && Date.now() - configCache.at < 60_000) return configCache.value;
  const { data, error } = await db.from("app_config").select("key, value");
  if (error) throw new Error("config_unavailable");
  const value: Config = {};
  for (const row of data ?? []) value[row.key] = row.value;
  configCache = { at: Date.now(), value };
  return value;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function safeName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-80);
  return cleaned || "file";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s()-]{6,24}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim();
  if (!t) return null;
  return t.length > max ? "__TOO_LONG__" : t;
}

async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const { data, error } = await db.rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return true; // fail open on limiter errors; validation still applies
  return data === true;
}

function magicMatches(type: string, bytes: Uint8Array) {
  if (type === "application/pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }
  if (type === "image/png") {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return sig.every((b, i) => bytes[i] === b);
  }
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return false;
}

function typeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [type, exts] of Object.entries(ALLOWED_TYPES)) {
    if (exts.some((e) => lower.endsWith(e))) return type;
  }
  return null;
}

// ---------------------------------------------------------------------
async function handleUploadUrl(body: Record<string, unknown>) {
  const session = typeof body.session === "string" ? body.session : "";
  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const size = typeof body.size === "number" ? body.size : -1;
  const type = typeof body.type === "string" ? body.type : "";
  const ipHash = typeof body.ipHash === "string" ? body.ipHash.slice(0, 64) : "unknown";

  if (!UUID_RE.test(session)) return json(400, { error: "invalid_session" });
  const nameType = typeFromName(fileName);
  if (!nameType || !ALLOWED_TYPES[type] || nameType !== type) {
    return json(422, { error: "file_type", message: "Only PDF, JPG and PNG files can be attached." });
  }
  if (size <= 0 || size > MAX_FILE_BYTES) {
    return json(422, { error: "file_size", message: "Each file must be 10 MB or smaller." });
  }
  if (!(await rateLimit(`upload:${ipHash}`, 40, 3600))) {
    return json(429, { error: "rate_limited", message: "Too many uploads. Please try again later." });
  }

  const { data: existing } = await db.storage.from(BUCKET).list(`incoming/${session}`, { limit: 20 });
  if ((existing?.length ?? 0) >= MAX_FILES) {
    return json(422, { error: "file_count", message: `You can attach up to ${MAX_FILES} files.` });
  }

  const path = `incoming/${session}/${crypto.randomUUID()}-${safeName(fileName)}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return json(503, { error: "storage_unavailable" });
  return json(200, { path: data.path, token: data.token, signedUrl: data.signedUrl });
}

// ---------------------------------------------------------------------
type FileRef = { path: string; name: string };

async function handleSubmit(body: Record<string, unknown>, cfg: Config) {
  const ipHash = typeof body.ipHash === "string" ? body.ipHash.slice(0, 64) : "unknown";
  if (!(await rateLimit(`submit:${ipHash}`, 6, 3600))) {
    return json(429, {
      error: "rate_limited",
      message: "Too many requests from this connection. Please call or WhatsApp us instead.",
    });
  }
  if (!(await rateLimit("submit:all", 300, 86400))) {
    return json(429, { error: "rate_limited", message: "We are receiving unusually many requests. Please call us." });
  }

  const f = (body.fields ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = str(f.name, 120);
  const company = str(f.company, 160);
  const phone = str(f.phone, 40);
  const email = str(f.email, 200);
  const service = str(f.service, 60);
  const location = str(f.location, 200);
  const scope = str(f.scope, 5000);
  const dimensions = str(f.dimensions, 1000);
  const quantities = str(f.quantities, 1000);
  const targetDate = str(f.targetDate, 10);
  const source = f.source === "assistant" ? "assistant" : "quote_form";
  const pagePath = str(body.pagePath, 200);

  if (!name || name === "__TOO_LONG__" || name.length < 2) errors.name = "Enter your name.";
  if (company === "__TOO_LONG__") errors.company = "Company name is too long.";
  if (!phone && !email) errors.contact = "Enter a phone number or an email address.";
  if (phone && (phone === "__TOO_LONG__" || !PHONE_RE.test(phone))) errors.phone = "Enter a valid phone number.";
  if (email && (email === "__TOO_LONG__" || !EMAIL_RE.test(email))) errors.email = "Enter a valid email address.";
  if (!service || !SERVICES.includes(service)) errors.service = "Choose a service.";
  if (!location || location === "__TOO_LONG__") errors.location = "Enter the project location.";
  if (!scope || scope === "__TOO_LONG__" || scope.length < 10) {
    errors.scope = "Describe the scope in at least 10 characters (maximum 5,000).";
  }
  if (dimensions === "__TOO_LONG__") errors.dimensions = "Dimensions are too long.";
  if (quantities === "__TOO_LONG__") errors.quantities = "Quantities are too long.";
  if (targetDate && (!DATE_RE.test(targetDate) || Number.isNaN(Date.parse(targetDate)))) {
    errors.targetDate = "Enter a valid date.";
  }
  if (f.consent !== true) errors.consent = "Please confirm we may use these details to respond.";

  const session = typeof body.session === "string" ? body.session : "";
  const files = Array.isArray(body.files) ? (body.files as FileRef[]) : [];
  if (files.length > MAX_FILES) errors.files = `You can attach up to ${MAX_FILES} files.`;
  if (files.length && !UUID_RE.test(session)) errors.files = "Attachment session expired. Please re-attach your files.";

  if (Object.keys(errors).length) return json(422, { error: "validation", fields: errors });

  // --- Validate attachments on the server ------------------------------
  const verified: { path: string; name: string; type: string; size: number }[] = [];
  if (files.length) {
    const { data: listed, error: listErr } = await db.storage
      .from(BUCKET)
      .list(`incoming/${session}`, { limit: 50 });
    if (listErr) return json(503, { error: "storage_unavailable" });
    const byPath = new Map((listed ?? []).map((o) => [`incoming/${session}/${o.name}`, o]));

    let total = 0;
    for (const ref of files) {
      if (typeof ref?.path !== "string" || !ref.path.startsWith(`incoming/${session}/`)) {
        return json(422, { error: "validation", fields: { files: "An attachment could not be matched. Please re-attach it." } });
      }
      const obj = byPath.get(ref.path);
      const displayName = typeof ref.name === "string" ? ref.name.slice(0, 120) : "file";
      if (!obj) {
        return json(422, { error: "validation", fields: { files: `“${displayName}” did not finish uploading. Please attach it again.` } });
      }
      // deno-lint-ignore no-explicit-any
      const meta = (obj as any).metadata ?? {};
      const size = Number(meta.size ?? 0);
      const declared = String(meta.mimetype ?? "");
      total += size;
      if (!size || size > MAX_FILE_BYTES) {
        await db.storage.from(BUCKET).remove([ref.path]);
        return json(422, { error: "validation", fields: { files: `“${displayName}” is larger than 10 MB.` } });
      }
      const type = typeFromName(ref.path);
      if (!type || (declared && declared !== type)) {
        await db.storage.from(BUCKET).remove([ref.path]);
        return json(422, { error: "validation", fields: { files: `“${displayName}” is not a PDF, JPG or PNG file.` } });
      }
      const { data: blob, error: dlErr } = await db.storage.from(BUCKET).download(ref.path);
      if (dlErr || !blob) return json(503, { error: "storage_unavailable" });
      const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
      if (!magicMatches(type, head)) {
        await db.storage.from(BUCKET).remove([ref.path]);
        return json(422, {
          error: "validation",
          fields: { files: `“${displayName}” doesn't look like a valid ${type === "application/pdf" ? "PDF" : "image"} file.` },
        });
      }
      verified.push({ path: ref.path, name: displayName, type, size });
    }
    if (total > MAX_TOTAL_BYTES) {
      return json(422, { error: "validation", fields: { files: "Attachments must total 25 MB or less." } });
    }
  }

  // --- Save the enquiry (this is the moment of success) -------------------
  const { data: ref, error: refErr } = await db.rpc("next_enquiry_reference");
  if (refErr || typeof ref !== "string") return json(503, { error: "database_unavailable" });

  const { data: row, error: insErr } = await db
    .from("enquiries")
    .insert({
      reference: ref,
      name,
      company,
      phone,
      email,
      service,
      location,
      scope,
      dimensions,
      quantities,
      target_date: targetDate,
      source,
      page_path: pagePath,
    })
    .select("id, reference")
    .single();
  if (insErr || !row) return json(503, { error: "database_unavailable" });

  // --- File the attachments under the reference ---------------------------
  for (let i = 0; i < verified.length; i++) {
    const v = verified[i];
    const dest = `enquiries/${row.reference}/${i + 1}-${safeName(v.name)}`;
    const { error: mvErr } = await db.storage.from(BUCKET).move(v.path, dest);
    await db.from("enquiry_files").insert({
      enquiry_id: row.id,
      storage_path: mvErr ? v.path : dest,
      original_name: v.name,
      mime_type: v.type,
      size_bytes: v.size,
    });
  }

  const notification = await notify(row.id, cfg, typeof body.siteUrl === "string" ? body.siteUrl : null);
  await db.rpc("track_event", {
    p_name: "enquiry_submitted",
    p_path: pagePath ?? "/quote",
    p_props: { service, source },
  });

  return json(200, { reference: row.reference, notification });
}

// ---------------------------------------------------------------------
async function notify(enquiryId: string, cfg: Config, siteUrl: string | null) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? cfg.resend_api_key ?? null;
  const to = Deno.env.get("NOTIFY_EMAIL_TO") ?? cfg.notify_to ?? null;
  const from = Deno.env.get("NOTIFY_EMAIL_FROM") ?? cfg.notify_from ?? null;

  if (!apiKey || !to || !from) {
    await db
      .from("enquiries")
      .update({ notification_status: "not_configured", notification_error: "Email notifications are not configured." })
      .eq("id", enquiryId);
    return "not_configured";
  }

  const { data: e } = await db
    .from("enquiries")
    .select("*, enquiry_files(original_name, size_bytes)")
    .eq("id", enquiryId)
    .single();
  if (!e) return "failed";

  const lines = [
    `New enquiry ${e.reference}`,
    "",
    `Name: ${e.name}`,
    e.company ? `Company: ${e.company}` : null,
    e.phone ? `Phone: ${e.phone}` : null,
    e.email ? `Email: ${e.email}` : null,
    `Service: ${e.service}`,
    `Location: ${e.location}`,
    e.target_date ? `Target date: ${e.target_date}` : null,
    e.dimensions ? `Dimensions: ${e.dimensions}` : null,
    e.quantities ? `Quantities: ${e.quantities}` : null,
    "",
    "Scope:",
    e.scope,
    "",
    `Attachments: ${(e.enquiry_files ?? []).length}`,
    siteUrl ? `Open in admin: ${siteUrl.replace(/\/$/, "")}/admin/enquiries/${e.id}` : null,
  ].filter((l) => l !== null);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `New quotation request ${e.reference} — ${e.service}`,
        text: lines.join("\n"),
        ...(e.email ? { reply_to: e.email } : {}),
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      await db
        .from("enquiries")
        .update({ notification_status: "failed", notification_error: `Email provider ${res.status}: ${detail}` })
        .eq("id", enquiryId);
      return "failed";
    }
    await db
      .from("enquiries")
      .update({ notification_status: "sent", notification_error: null, notified_at: new Date().toISOString() })
      .eq("id", enquiryId);
    return "sent";
  } catch (err) {
    await db
      .from("enquiries")
      .update({ notification_status: "failed", notification_error: String(err).slice(0, 300) })
      .eq("id", enquiryId);
    return "failed";
  }
}

// ---------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let cfg: Config;
  try {
    cfg = await getConfig();
  } catch {
    return json(503, { error: "config_unavailable" });
  }
  const expected = cfg.enquiry_function_secret ?? "";
  const provided = req.headers.get("x-enquiry-secret") ?? "";
  if (!expected || !safeEqual(provided, expected)) return json(401, { error: "unauthorized" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  try {
    switch (body.action) {
      case "upload-url":
        return await handleUploadUrl(body);
      case "submit":
        return await handleSubmit(body, cfg);
      case "notify": {
        if (typeof body.enquiryId !== "string" || !UUID_RE.test(body.enquiryId)) {
          return json(400, { error: "invalid_enquiry" });
        }
        const status = await notify(body.enquiryId, cfg, typeof body.siteUrl === "string" ? body.siteUrl : null);
        return json(200, { notification: status });
      }
      default:
        return json(400, { error: "unknown_action" });
    }
  } catch (err) {
    console.error("submit-enquiry error", err);
    return json(500, { error: "internal_error" });
  }
});
