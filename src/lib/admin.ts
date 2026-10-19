import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

// Every admin page and action starts here. Being signed in is not enough:
// the user must be listed in public.staff (RLS enforces the same rule).
//
// Speed: getClaims() verifies the session token locally when the project uses
// asymmetric signing keys (no round trip to the auth server), and cache()
// shares one result between the layout and the page in the same request.
export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims?.sub) redirect("/admin/login");
  const { data: staff } = await supabase.from("staff").select("role").eq("user_id", claims.sub).maybeSingle();
  if (!staff) redirect("/admin/login?error=not-staff");
  return {
    supabase,
    user: { id: claims.sub, email: (claims.email as string | undefined) ?? "" },
    role: staff.role as "admin" | "staff",
  };
});

// Called after every admin save: expires the cached content reads and every
// public page, so the next visitor (and the staff member checking) sees the
// change straight away.
export function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

export function text(form: FormData, key: string, max = 5000): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export function lines(form: FormData, key: string): string[] {
  const v = text(form, key, 20000);
  return v ? v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
}

export function int(form: FormData, key: string): number | null {
  const v = text(form, key, 20);
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true";
}

export function back(path: string, message: string, kind: "saved" | "error" = "saved"): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(message)}`);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Like requireStaff, but only for the "admin" role (Team, Motion & effects). */
export async function requireAdmin() {
  const ctx = await requireStaff();
  if (ctx.role !== "admin") redirect("/admin?error=" + encodeURIComponent("That area is for admins only."));
  return ctx;
}
