import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import * as seed from "./seed";
import { projectImages, blogImage } from "./stock";
import { sanitizeArticle } from "@/lib/html";
import type {
  Company,
  Service,
  Project,
  Faq,
  Highlight,
  ProcessStep,
  Certification,
  CompanyDocument,
  BlogPost,
  BlogPostSummary,
  ImageRef,
  IllustrationKey,
  ProjectStatus,
  ClientLogo,
} from "./types";

export type * from "./types";

// CONTENT_SOURCE=seed reads the bundled seed instead of Supabase. It exists
// for offline builds and automated tests only; production reads Supabase.
const USE_SEED = process.env.CONTENT_SOURCE === "seed";

const ILLUSTRATIONS: IllustrationKey[] = ["ibeam", "pipe", "cnc", "tank", "rail"];

function img(src: string | null, alt: string | null, w: number | null, h: number | null): ImageRef | null {
  if (!src) return null;
  return { src, alt: alt ?? "", width: w ?? 1200, height: h ?? 900 };
}

function fail(what: string, error: unknown): never {
  // Surface data errors loudly: a silently empty page would look like
  // missing content rather than an outage.
  throw new Error(`Content load failed (${what}): ${error instanceof Error ? error.message : JSON.stringify(error)}`);
}

// ---------------------------------------------------------------------------

export const getCompany = cache(async (): Promise<Company> => {
  if (USE_SEED) return seed.company;
  const { data, error } = await publicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) fail("site_settings", error);
  if (!data) return seed.company;
  const phones = [data.phone_1, data.phone_2]
    .filter((p): p is string => !!p)
    .map((display) => ({ display, e164: "+" + display.replace(/[^0-9]/g, "") }));
  return {
    name: data.company_name ?? seed.company.name,
    tagline: data.tagline ?? "",
    heroTitle: data.hero_title ?? seed.company.heroTitle,
    heroSubtitle: data.hero_subtitle ?? "",
    aboutTitle: data.about_title ?? "",
    aboutBody: data.about_body ?? "",
    establishedYear: data.established_year ?? null,
    address: data.address ?? "",
    phones,
    whatsapp: data.whatsapp ? data.whatsapp.replace(/[^0-9]/g, "") : null,
    email: data.email ?? null,
    hours: data.business_hours ?? null,
    facebookUrl: data.facebook_url ?? null,
    instagramUrl: data.instagram_url ?? null,
    mapsUrl: data.maps_url ?? null,
    logoUrl: data.logo_url || seed.company.logoUrl,
  };
});

// ---------------------------------------------------------------------------

type ServiceRow = {
  slug: string;
  number: string | null;
  title: string;
  summary: string | null;
  intro: string | null;
  bullets: string[] | null;
  applications: string[] | null;
  illustration: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_width: number | null;
  image_height: number | null;
  seo_title: string | null;
  seo_description: string | null;
};

function mapService(r: ServiceRow, i: number): Service {
  const ill = ILLUSTRATIONS.includes(r.illustration as IllustrationKey)
    ? (r.illustration as IllustrationKey)
    : ILLUSTRATIONS[i % ILLUSTRATIONS.length];
  return {
    slug: r.slug,
    number: r.number ?? String(i + 1).padStart(2, "0"),
    title: r.title,
    summary: r.summary ?? "",
    intro: r.intro ?? r.summary ?? "",
    scope: r.bullets ?? [],
    applications: r.applications ?? [],
    illustration: ill,
    image: img(r.image_url, r.image_alt, r.image_width, r.image_height),
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
  };
}

export const getServices = cache(async (): Promise<Service[]> => {
  if (USE_SEED) return seed.services;
  const { data, error } = await publicClient()
    .from("services")
    .select("slug, number, title, summary, intro, bullets, applications, illustration, image_url, image_alt, image_width, image_height, seo_title, seo_description")
    .eq("published", true)
    .not("slug", "is", null)
    .order("sort_order", { ascending: true });
  if (error) fail("services", error);
  return (data ?? []).map((r, i) => mapService(r as ServiceRow, i));
});

export async function getService(slug: string): Promise<Service | null> {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------

type ProjectRow = {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  location: string | null;
  emirate: string | null;
  sector: string | null;
  status: string | null;
  scope: string | null;
  description: string | null;
  services: string[] | null;
  client_name: string | null;
  client_public: boolean | null;
  year: string | null;
  featured: boolean | null;
  project_images: { url: string; alt: string; width: number | null; height: number | null; sort_order: number }[] | null;
};

function mapProject(r: ProjectRow, i: number): Project {
  return {
    slug: r.slug,
    code: r.code ?? `PRJ-${String(i + 1).padStart(2, "0")}`,
    title: r.title,
    location: r.location ?? r.emirate ?? "UAE",
    emirate: r.emirate ?? "",
    sector: r.sector ?? "",
    status: (r.status === "ongoing" ? "ongoing" : "completed") as ProjectStatus,
    scope: r.scope ?? "",
    description: r.description ?? "",
    services: r.services ?? [],
    clientName: r.client_public ? r.client_name : null,
    year: r.year,
    featured: !!r.featured,
    images: (r.project_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => img(p.url, p.alt, p.width, p.height)!)
      .filter(Boolean),
  };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  if (USE_SEED) return seed.projects.map((p) => ({ ...p, images: projectImages(p) }));
  const { data, error } = await publicClient()
    .from("projects")
    .select("id, slug, code, title, location, emirate, sector, status, scope, description, services, client_name, client_public, year, featured, project_images(url, alt, width, height, sort_order)")
    .eq("published", true)
    .not("slug", "is", null)
    .order("sort_order", { ascending: true });
  if (error) fail("projects", error);
  return (data ?? []).map((r, i) => {
    const p = mapProject(r as unknown as ProjectRow, i);
    return { ...p, images: projectImages(p) };
  });
});

export async function getProject(slug: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------

export const getFaqs = cache(async (): Promise<Faq[]> => {
  if (USE_SEED) return seed.faqs;
  const { data, error } = await publicClient()
    .from("faqs")
    .select("id, scope, question, answer")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) fail("faqs", error);
  return (data ?? []) as Faq[];
});

export async function getFaqsFor(scope: string): Promise<Faq[]> {
  return (await getFaqs()).filter((f) => f.scope === scope);
}

export const getHighlights = cache(async (): Promise<Highlight[]> => {
  if (USE_SEED) return seed.highlights;
  const { data, error } = await publicClient()
    .from("highlights")
    .select("label, value, detail")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) fail("highlights", error);
  return (data ?? []) as Highlight[];
});

export const getProcessSteps = cache(async (): Promise<ProcessStep[]> => {
  if (USE_SEED) return seed.processSteps;
  const { data, error } = await publicClient()
    .from("process_steps")
    .select("title, body")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) fail("process_steps", error);
  return (data ?? []) as ProcessStep[];
});

export const getCertifications = cache(async (): Promise<Certification[]> => {
  if (USE_SEED) return seed.certifications;
  // RLS returns only published, verified, unexpired certificates.
  const { data, error } = await publicClient()
    .from("certifications")
    .select("id, title, standard, issuer, certificate_number, valid_until, image_url, file_url")
    .order("sort_order", { ascending: true });
  if (error) fail("certifications", error);
  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    standard: c.standard,
    issuer: c.issuer,
    certificateNumber: c.certificate_number,
    validUntil: c.valid_until,
    image: img(c.image_url, c.title, null, null),
    fileUrl: c.file_url,
  }));
});

export const getClientLogos = cache(async (): Promise<ClientLogo[]> => {
  if (USE_SEED) return seed.clientLogos;
  const { data, error } = await publicClient()
    .from("client_logos")
    .select("name, logo_url, width, height")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  // The strip is decorative social proof: fall back to nothing rather than
  // failing the whole home page if this table is unavailable.
  if (error) return [];
  return (data ?? []).map((c) => ({
    name: c.name,
    logo: { src: c.logo_url, alt: `${c.name} logo`, width: c.width ?? 320, height: c.height ?? 120 },
  }));
});

export const getDocuments = cache(async (): Promise<CompanyDocument[]> => {
  if (USE_SEED) return seed.documents;
  const { data, error } = await publicClient()
    .from("documents")
    .select("id, title, kind, file_url, file_size")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) fail("documents", error);
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    kind: d.kind,
    fileUrl: d.file_url,
    fileSize: d.file_size,
  }));
});

// ---------------------------------------------------------------------------

function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function splitTags(t: string | null): string[] {
  return (t ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);
}

type BlogRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  featured_image: string | null;
  tags: string | null;
  author: string | null;
  content: string;
};

// Only images we host (site files or the CMS media bucket) are shown; old
// links to the former WordPress site no longer resolve.
const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "";
  }
})();
function hostedImage(src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("/")) return src;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && SUPABASE_HOST && u.host === SUPABASE_HOST ? src : null;
  } catch {
    return null;
  }
}

function toSummary(p: BlogRow): BlogPostSummary {
  const summary = {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.published_at,
    image: null as string | null,
    tags: splitTags(p.tags),
    author: p.author,
    readingMinutes: readingMinutes(p.content ?? ""),
  };
  return { ...summary, image: blogImage({ ...summary, image: hostedImage(p.featured_image) }) };
}

export const getBlogPosts = cache(async (): Promise<BlogPostSummary[]> => {
  if (USE_SEED) return seed.blogPosts;
  const { data, error } = await publicClient()
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, featured_image, tags, author, content")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) fail("blog_posts", error);
  return ((data ?? []) as BlogRow[]).map(toSummary);
});

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (USE_SEED) return seed.blogPosts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await publicClient()
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, featured_image, tags, author, content, meta_title, meta_description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("blog_post", error);
  if (!data) return null;
  return {
    ...toSummary(data as BlogRow),
    content: sanitizeArticle(data.content),
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
  };
}

// Helpers -------------------------------------------------------------------

export function projectsForService(projects: Project[], slug: string) {
  return projects.filter((p) => p.services.includes(slug));
}
