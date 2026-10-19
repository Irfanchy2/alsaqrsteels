"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireAdmin, refreshSite, text, lines, int, bool, back, slugify } from "@/lib/admin";
import { PAGES } from "@/lib/content/pages";
import { callEnquiryFunction } from "@/lib/enquiry-backend";
import { SITE_URL } from "@/lib/site";
import { sanitizeArticle } from "@/lib/html";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- Enquiries
const STATUSES = ["new", "reviewing", "quoted", "won", "lost", "closed", "spam"];

export async function updateEnquiry(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60)!;
  const status = text(form, "status", 20);
  const path = `/admin/enquiries/${id}`;
  if (!status || !STATUSES.includes(status)) back(path, "Choose a valid status.", "error");
  const { error } = await supabase
    .from("enquiries")
    .update({ status, staff_notes: text(form, "staff_notes", 5000), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) back(path, `Could not save: ${error.message}`, "error");
  back(path, "Enquiry updated.");
}

export async function retryNotification(form: FormData) {
  await requireStaff();
  const id = text(form, "id", 60)!;
  const path = `/admin/enquiries/${id}`;
  const result = await callEnquiryFunction({ action: "notify", enquiryId: id, siteUrl: SITE_URL });
  const status = (result.body.notification as string) ?? "failed";
  if (result.status !== 200) back(path, "The notification service is unavailable.", "error");
  if (status === "sent") back(path, "Notification email sent.");
  if (status === "not_configured") back(path, "Email notifications are not configured yet (see the setup guide).", "error");
  back(path, "The email provider rejected the notification. See the error below.", "error");
}

export async function deleteEnquiry(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60)!;
  if (!bool(form, "confirm")) back(`/admin/enquiries/${id}`, "Tick the confirmation box to delete.", "error");
  const { data: files } = await supabase.from("enquiry_files").select("storage_path").eq("enquiry_id", id);
  if (files?.length) {
    const { error: sErr } = await supabase.storage.from("enquiry-files").remove(files.map((f) => f.storage_path));
    if (sErr) back(`/admin/enquiries/${id}`, `Could not delete attachments: ${sErr.message}`, "error");
  }
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) back(`/admin/enquiries/${id}`, `Could not delete: ${error.message}`, "error");
  back("/admin/enquiries", "Enquiry and its attachments deleted.");
}

// ---------------------------------------------------------------- Projects
export async function saveProject(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  const title = text(form, "title", 200);
  if (!title) back(id ? `/admin/projects/${id}` : "/admin/projects/new", "Title is required.", "error");
  const slug = slugify(text(form, "slug", 100) ?? title);
  const status = text(form, "status", 20);
  const row = {
    title,
    slug,
    code: text(form, "code", 20),
    location: text(form, "location", 200),
    emirate: text(form, "emirate", 60),
    sector: text(form, "sector", 80),
    status: status === "ongoing" ? "ongoing" : "completed",
    scope: text(form, "scope", 300),
    description: text(form, "description", 4000),
    services: form.getAll("services").filter((s): s is string => typeof s === "string"),
    client_name: text(form, "client_name", 200),
    client_public: bool(form, "client_public"),
    year: text(form, "year", 10),
    featured: bool(form, "featured"),
    published: bool(form, "published"),
    sort_order: int(form, "sort_order") ?? 0,
    category: "projects",
    updated_at: new Date().toISOString(),
  };
  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) back(`/admin/projects/${id}`, `Could not save: ${error.message}`, "error");
    refreshSite();
    back(`/admin/projects/${id}`, "Project saved.");
  }
  const { data, error } = await supabase.from("projects").insert(row).select("id").single();
  if (error || !data) back("/admin/projects/new", `Could not create: ${error?.message}`, "error");
  refreshSite();
  back(`/admin/projects/${data.id}`, "Project created. Add photographs below.");
}

export async function addProjectImage(form: FormData) {
  const { supabase } = await requireStaff();
  const projectId = text(form, "project_id", 60)!;
  const url = text(form, "url", 1000);
  const alt = text(form, "alt", 300);
  const path = `/admin/projects/${projectId}`;
  if (!url) back(path, "Upload a photo first.", "error");
  if (!alt) back(path, "Describe the photo (alt text) so it is accessible.", "error");
  const { count } = await supabase.from("project_images").select("id", { count: "exact", head: true }).eq("project_id", projectId);
  const { error } = await supabase.from("project_images").insert({
    project_id: projectId,
    url,
    alt,
    width: int(form, "url_width"),
    height: int(form, "url_height"),
    sort_order: (count ?? 0) + 1,
  });
  if (error) back(path, `Could not add photo: ${error.message}`, "error");
  refreshSite();
  back(path, "Photo added.");
}

export async function updateProjectImage(form: FormData) {
  const { supabase } = await requireStaff();
  const projectId = text(form, "project_id", 60)!;
  const id = text(form, "id", 60)!;
  const path = `/admin/projects/${projectId}`;
  if (bool(form, "delete")) {
    await supabase.from("project_images").delete().eq("id", id);
    refreshSite();
    back(path, "Photo removed from the project.");
  }
  const { error } = await supabase
    .from("project_images")
    .update({ alt: text(form, "alt", 300) ?? "", sort_order: int(form, "sort_order") ?? 0 })
    .eq("id", id);
  if (error) back(path, `Could not save photo: ${error.message}`, "error");
  refreshSite();
  back(path, "Photo updated.");
}

// ---------------------------------------------------------------- Services
export async function saveService(form: FormData) {
  const { supabase } = await requireStaff();
  const slug = text(form, "slug", 100)!;
  const path = `/admin/services/${slug}`;
  const title = text(form, "title", 120);
  if (!title) back(path, "Title is required.", "error");
  const { error } = await supabase
    .from("services")
    .update({
      title,
      number: text(form, "number", 4),
      summary: text(form, "summary", 400),
      intro: text(form, "intro", 2000),
      bullets: lines(form, "scope"),
      applications: lines(form, "applications"),
      illustration: text(form, "illustration", 20),
      image_url: text(form, "image", 1000),
      image_alt: text(form, "image_alt", 300),
      image_width: int(form, "image_width"),
      image_height: int(form, "image_height"),
      seo_title: text(form, "seo_title", 120),
      seo_description: text(form, "seo_description", 300),
      published: bool(form, "published"),
      sort_order: int(form, "sort_order") ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) back(path, `Could not save: ${error.message}`, "error");
  refreshSite();
  back(path, "Service saved.");
}

// ---------------------------------------------------------------- FAQs
export async function saveFaq(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  if (bool(form, "delete") && id) {
    await supabase.from("faqs").delete().eq("id", id);
    refreshSite();
    back("/admin/faqs", "Question deleted.");
  }
  const row = {
    scope: text(form, "scope", 60) ?? "general",
    question: text(form, "question", 300),
    answer: text(form, "answer", 2000),
    sort_order: int(form, "sort_order") ?? 0,
    published: bool(form, "published"),
    updated_at: new Date().toISOString(),
  };
  if (!row.question || !row.answer) back("/admin/faqs", "Question and answer are both required.", "error");
  const { error } = id ? await supabase.from("faqs").update(row).eq("id", id) : await supabase.from("faqs").insert(row);
  if (error) back("/admin/faqs", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/faqs", id ? "Question saved." : "Question added.");
}

// ---------------------------------------------------------------- Client logos
// Called directly from the Client logos screen: every change saves at once.
export type ActionResult = { ok: true } | { ok: false; error: string };

const MEDIA_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/media/`;
function validLogoUrl(u: string) {
  return u.startsWith("/images/clients/") || (MEDIA_PREFIX.length > 40 && u.startsWith(MEDIA_PREFIX));
}

export async function addClientLogo(input: { name: string; url: string; width: number | null; height: number | null }): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const name = (input.name ?? "").trim().slice(0, 160) || "Client";
  if (!validLogoUrl(input.url)) return { ok: false, error: "Upload the logo again." };
  const { data: last } = await supabase.from("client_logos").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("client_logos").insert({
    name,
    logo_url: input.url,
    width: input.width,
    height: input.height,
    sort_order: (last?.sort_order ?? 0) + 10,
    published: true,
  });
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}

export async function updateClientLogo(
  id: string,
  patch: { name?: string; url?: string; width?: number | null; height?: number | null; published?: boolean }
): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) {
    const n = patch.name.trim().slice(0, 160);
    if (!n) return { ok: false, error: "The client name can't be empty." };
    row.name = n;
  }
  if (patch.url !== undefined) {
    if (!validLogoUrl(patch.url)) return { ok: false, error: "Upload the logo again." };
    row.logo_url = patch.url;
    row.width = patch.width ?? null;
    row.height = patch.height ?? null;
  }
  if (patch.published !== undefined) row.published = patch.published;
  const { error } = await supabase.from("client_logos").update(row).eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}

export async function moveClientLogo(id: string, direction: -1 | 1): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("client_logos").select("id, sort_order").order("sort_order").order("created_at");
  const list = data ?? [];
  const i = list.findIndex((l) => l.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };
  [list[i], list[j]] = [list[j], list[i]];
  const results = await Promise.all(
    list.map((l, k) => supabase.from("client_logos").update({ sort_order: (k + 1) * 10 }).eq("id", l.id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  refreshSite();
  return { ok: true };
}

export async function deleteClientLogo(id: string): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from("client_logos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------- Certifications
export async function saveCertification(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  if (bool(form, "delete") && id) {
    await supabase.from("certifications").delete().eq("id", id);
    refreshSite();
    back("/admin/certifications", "Certificate removed.");
  }
  const verified = bool(form, "verified");
  const published = bool(form, "published");
  const validUntil = text(form, "valid_until", 10);
  const row = {
    title: text(form, "title", 200),
    standard: text(form, "standard", 200),
    issuer: text(form, "issuer", 300),
    holder_name: text(form, "holder_name", 300),
    certificate_number: text(form, "certificate_number", 100),
    valid_until: validUntil,
    image_url: text(form, "image", 1000),
    file_url: text(form, "file", 1000),
    verified,
    published,
    staff_note: text(form, "staff_note", 1000),
    sort_order: int(form, "sort_order") ?? 0,
  };
  if (!row.title) back("/admin/certifications", "Title is required.", "error");
  if (published && !verified) {
    back("/admin/certifications", "A certificate can only be published after you tick “Checked and current”.", "error");
  }
  if (verified && (!row.holder_name || !(row.image_url || row.file_url))) {
    back("/admin/certifications", "To mark a certificate as checked, record the holder name and upload the certificate.", "error");
  }
  const { error } = id
    ? await supabase.from("certifications").update(row).eq("id", id)
    : await supabase.from("certifications").insert(row);
  if (error) back("/admin/certifications", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/certifications", "Certificate saved.");
}

// ---------------------------------------------------------------- Documents
export async function saveDocument(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  if (bool(form, "delete") && id) {
    await supabase.from("documents").delete().eq("id", id);
    refreshSite();
    back("/admin/documents", "Document removed.");
  }
  const kind = text(form, "kind", 30);
  const row = {
    title: text(form, "title", 200),
    kind: kind === "company_profile" || kind === "certificate" ? kind : "other",
    file_url: text(form, "file", 1000),
    file_size: int(form, "file_bytes"),
    published: bool(form, "published"),
  };
  if (!row.title || !row.file_url) back("/admin/documents", "Give the document a title and upload the file.", "error");
  const { error } = id
    ? await supabase.from("documents").update(row).eq("id", id)
    : await supabase.from("documents").insert(row);
  if (error) back("/admin/documents", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/documents", "Document saved.");
}

// ---------------------------------------------------------------- Company
export async function saveCompany(form: FormData) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("site_settings")
    .update({
      company_name: text(form, "company_name", 200),
      tagline: text(form, "tagline", 400),
      hero_title: text(form, "hero_title", 200),
      hero_subtitle: text(form, "hero_subtitle", 600),
      about_title: text(form, "about_title", 200),
      about_body: text(form, "about_body", 4000),
      established_year: int(form, "established_year"),
      address: text(form, "address", 300),
      phone_1: text(form, "phone_1", 40),
      phone_2: text(form, "phone_2", 40),
      whatsapp: text(form, "whatsapp", 20)?.replace(/[^0-9]/g, "") ?? null,
      email: text(form, "email", 200),
      business_hours: text(form, "business_hours", 300),
      facebook_url: text(form, "facebook_url", 300),
      instagram_url: text(form, "instagram_url", 300),
      maps_url: text(form, "maps_url", 500),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) back("/admin/settings", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/settings", "Company details saved.");
}

export async function saveHighlight(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  if (bool(form, "delete") && id) {
    await supabase.from("highlights").delete().eq("id", id);
    refreshSite();
    back("/admin/settings#highlights", "Highlight removed.");
  }
  const row = {
    label: text(form, "label", 60),
    value: text(form, "value", 60),
    detail: text(form, "detail", 160),
    sort_order: int(form, "sort_order") ?? 0,
    published: bool(form, "published"),
  };
  if (!row.label || !row.value) back("/admin/settings#highlights", "Label and value are required.", "error");
  const { error } = id ? await supabase.from("highlights").update(row).eq("id", id) : await supabase.from("highlights").insert(row);
  if (error) back("/admin/settings#highlights", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/settings#highlights", "Highlight saved.");
}

export async function saveStep(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 60);
  if (bool(form, "delete") && id) {
    await supabase.from("process_steps").delete().eq("id", id);
    refreshSite();
    back("/admin/settings#process", "Step removed.");
  }
  const row = {
    title: text(form, "title", 120),
    body: text(form, "body", 600),
    sort_order: int(form, "sort_order") ?? 0,
    published: bool(form, "published"),
  };
  if (!row.title || !row.body) back("/admin/settings#process", "Title and description are required.", "error");
  const { error } = id ? await supabase.from("process_steps").update(row).eq("id", id) : await supabase.from("process_steps").insert(row);
  if (error) back("/admin/settings#process", `Could not save: ${error.message}`, "error");
  refreshSite();
  back("/admin/settings#process", "Step saved.");
}

// ---------------------------------------------------------------- Blog
export async function saveBlogPost(form: FormData) {
  const { supabase, user } = await requireStaff();
  const id = text(form, "id", 60);
  const listPath = "/admin/blog";
  if (bool(form, "delete") && id) {
    await supabase.from("blog_posts").delete().eq("id", id);
    refreshSite();
    back(listPath, "Post deleted.");
  }
  const title = text(form, "title", 200);
  const editPath = id ? `/admin/blog/${id}` : "/admin/blog/new";
  if (!title) back(editPath, "A title is required.", "error");
  const content = sanitizeArticle(text(form, "content", 200_000) ?? "");
  const status = text(form, "status", 20) === "published" ? "published" : "draft";
  if (status === "published" && content.replace(/<[^>]+>/g, "").trim().length < 40) {
    back(editPath, "Write the article before publishing (it is nearly empty).", "error");
  }
  const date = text(form, "published_at", 10);
  const publishedAt = date ? new Date(`${date}T08:00:00+04:00`).toISOString() : status === "published" ? new Date().toISOString() : null;
  const row = {
    title: title!,
    slug: slugify(text(form, "slug", 100) ?? title!) || `post-${Date.now()}`,
    excerpt: text(form, "excerpt", 400),
    content,
    featured_image: text(form, "image", 1000),
    tags: (text(form, "tags", 300) ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join(", ") || null,
    author: text(form, "author", 120),
    meta_title: text(form, "meta_title", 70),
    meta_description: text(form, "meta_description", 170),
    status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };
  // Keep web addresses unique without losing the article to an error.
  const { data: clash } = await supabase.from("blog_posts").select("id").eq("slug", row.slug).neq("id", id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
  if (clash) row.slug = `${row.slug}-${Date.now().toString(36).slice(-4)}`;
  const res = id
    ? await supabase.from("blog_posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("blog_posts").insert({ ...row, author: row.author ?? user.email.split("@")[0] }).select("id").single();
  if (res.error) {
    const msg = res.error.code === "23505" ? "Another post already uses this web address (slug). Change the slug." : res.error.message;
    back(editPath, `Could not save: ${msg}`, "error");
  }
  refreshSite();
  back(`/admin/blog/${res.data!.id}`, status === "published" ? "Saved and published." : "Draft saved.");
}

// ---------------------------------------------------------------- Pages
export async function savePage(form: FormData) {
  const { supabase, user } = await requireStaff();
  const key = text(form, "page", 60) ?? "";
  const def = PAGES.find((p) => p.key === key);
  if (!def) back("/admin/pages", "Unknown page.", "error");
  const data: Record<string, Record<string, string | boolean>> = {};
  for (const s of def!.sections) {
    const sec: Record<string, string | boolean> = {};
    if (s.hideable) sec._hidden = !bool(form, `${s.key}._visible`);
    for (const f of s.fields) {
      const v = text(form, `${s.key}.${f.key}`, f.type === "textarea" ? 3000 : 600);
      // Store only what differs from the default, so future default
      // improvements still reach sections nobody has customised.
      if (v && v !== f.default) sec[f.key] = v;
    }
    if (Object.keys(sec).length) data[s.key] = sec;
  }
  const { error } = await supabase
    .from("site_content")
    .upsert({ key: `page:${key}`, data, updated_at: new Date().toISOString(), updated_by: user.id });
  if (error) back(`/admin/pages/${key}`, contentError(error.message), "error");
  refreshSite();
  back(`/admin/pages/${key}`, `${def!.label} page saved.`);
}

export async function resetPage(form: FormData) {
  const { supabase } = await requireStaff();
  const key = text(form, "page", 60) ?? "";
  const { error } = await supabase.from("site_content").delete().eq("key", `page:${key}`);
  if (error) back(`/admin/pages/${key}`, contentError(error.message), "error");
  refreshSite();
  back(`/admin/pages/${key}`, "Page reset to the original text.");
}

// ---------------------------------------------------------------- Motion
export async function saveMotion(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const speed = Number(text(form, "speed", 10) ?? "1");
  const data = {
    enabled: bool(form, "enabled"),
    speed: Math.min(2, Math.max(0.5, Number.isFinite(speed) ? speed : 1)),
    cursor: bool(form, "cursor"),
    sparks: bool(form, "sparks"),
    heroSparks: bool(form, "heroSparks"),
    ticker: bool(form, "ticker"),
    reveals: bool(form, "reveals"),
    tilt: bool(form, "tilt"),
    trail: bool(form, "trail"),
    headingSpark: bool(form, "headingSpark"),
  };
  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "motion", data, updated_at: new Date().toISOString(), updated_by: user.id });
  if (error) back("/admin/motion", contentError(error.message), "error");
  refreshSite();
  back("/admin/motion", "Motion settings saved.");
}

// ---------------------------------------------------------------- Team
export async function addStaff(form: FormData) {
  const { supabase } = await requireAdmin();
  const email = text(form, "email", 200);
  const role = text(form, "role", 10) === "admin" ? "admin" : "staff";
  if (!email) back("/admin/team", "Enter an email address.", "error");
  const { data, error } = await supabase.rpc("admin_add_staff", { p_email: email, p_role: role });
  if (error) back("/admin/team", teamError(error.message), "error");
  back("/admin/team", `${data ?? email} can now sign in to the admin as ${role === "admin" ? "an Admin" : "an Editor"}.`);
}

export async function setStaffRole(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(form, "user_id", 60);
  const role = text(form, "role", 10) === "admin" ? "admin" : "staff";
  const { error } = await supabase.rpc("admin_set_staff_role", { p_user: id, p_role: role });
  if (error) back("/admin/team", teamError(error.message), "error");
  back("/admin/team", "Role updated.");
}

export async function removeStaff(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(form, "user_id", 60);
  const { error } = await supabase.rpc("admin_remove_staff", { p_user: id });
  if (error) back("/admin/team", teamError(error.message), "error");
  back("/admin/team", "Removed from the team. Their login still exists but can no longer open the admin.");
}

function contentError(msg: string) {
  return /site_content|relation .* does not exist|schema cache/i.test(msg)
    ? "Saving needs a one-time database update. Run supabase/migrations/20261020090000_site_content_team.sql in Supabase → SQL Editor, then try again."
    : `Could not save: ${msg}`;
}
function teamError(msg: string) {
  return /function .* does not exist|schema cache/i.test(msg)
    ? "Team management needs a one-time database update. Run supabase/migrations/20261020090000_site_content_team.sql in Supabase → SQL Editor."
    : msg;
}
