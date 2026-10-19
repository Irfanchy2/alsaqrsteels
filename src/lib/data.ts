import { createClient } from "@/lib/supabase/server";
import type {
  SiteSettings,
  Service,
  Industry,
  Project,
  Certification,
  Testimonial,
  Partner,
  Page,
  PageBlock,
  BlogPost,
} from "@/lib/types";

// All reads are server-side (Server Components), scoped to what the public
// RLS policies allow — published rows only, via the anon key. Nothing here
// requires auth.

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

export async function getIndustries(): Promise<Industry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("industries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getCertifications(): Promise<Certification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certifications")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getNavPages(): Promise<Page[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("show_in_nav", true)
    .order("nav_order", { ascending: true });
  return data ?? [];
}

export async function getFooterPages(): Promise<Page[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("show_in_footer", true)
    .order("nav_order", { ascending: true });
  return data ?? [];
}

export async function getPageBySlug(
  slug: string
): Promise<{ page: Page; blocks: PageBlock[] } | null> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!page) return null;
  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("position", { ascending: true });
  return { page, blocks: blocks ?? [] };
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}
