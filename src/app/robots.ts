import type { MetadataRoute } from "next";
import { SITE_URL, INDEXABLE } from "@/lib/site";

// Staging and preview deployments are closed to crawlers. Set
// NEXT_PUBLIC_SITE_INDEXABLE=true only on the production domain.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/quote/submitted"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
