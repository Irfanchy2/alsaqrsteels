import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL, isProductionHost } from "@/lib/site";

// Only the real domain is open to crawlers; test domains and previews are not.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  if (!isProductionHost(host)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/quote/submitted"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
