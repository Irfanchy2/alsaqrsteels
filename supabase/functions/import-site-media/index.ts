// Supabase Edge Function: import-site-media (one-off utility)
//
// Copies the two genuine workshop photographs from the old website into the
// public "media" bucket, so the new site serves them from CMS storage.
// Fixed allowlist of sources; protected by the same shared secret as
// submit-enquiry. Safe to run more than once (upsert).

import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const SOURCES = [
  { from: "https://alsaqrsteels.com/images/hero.jpg", to: "site/steel-frame-yard.jpg" },
  { from: "https://alsaqrsteels.com/images/about.jpg", to: "site/tank-frame-yard.jpg" },
  { from: "https://alsaqrsteels.com/images/logo-mark.png", to: "site/logo-horizontal.png" },
];

Deno.serve(async (req) => {
  const { data } = await db.from("app_config").select("value").eq("key", "enquiry_function_secret").maybeSingle();
  const expected = data?.value ?? "";
  if (!expected || req.headers.get("x-enquiry-secret") !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const results = [];
  for (const s of SOURCES) {
    try {
      const res = await fetch(s.from);
      if (!res.ok) throw new Error(`source ${res.status}`);
      const type = res.headers.get("content-type") ?? (s.to.endsWith(".png") ? "image/png" : "image/jpeg");
      const bytes = new Uint8Array(await res.arrayBuffer());
      const { error } = await db.storage.from("media").upload(s.to, bytes, {
        contentType: type.split(";")[0],
        upsert: true,
        cacheControl: "31536000",
      });
      if (error) throw error;
      const { data: pub } = db.storage.from("media").getPublicUrl(s.to);
      results.push({ path: s.to, bytes: bytes.length, url: pub.publicUrl, ok: true });
    } catch (e) {
      results.push({ path: s.to, ok: false, error: String(e) });
    }
  }
  return new Response(JSON.stringify({ results }), { headers: { "Content-Type": "application/json" } });
});
