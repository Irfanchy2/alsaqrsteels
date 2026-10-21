import type { MetadataRoute } from "next";
import { getServices, getProjects, getBlogPosts, getCustomPages } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts, custom] = await Promise.all([getServices(), getProjects(), getBlogPosts(), getCustomPages()]);
  const staticPages = ["", "/about", "/services", "/projects", "/quality", "/quote", "/contact", "/blog", "/privacy", "/terms"];
  return [
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/quote" || p === "/services" ? 0.9 : 0.6,
    })),
    ...services.map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...custom.map((p) => ({ url: `${SITE_URL}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
