// Deployment-level settings. Business facts live in the CMS (site_settings);
// only technical switches belong here.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

// Search engines may index the site only on its real domain. Any other
// address (the Hostinger test domain, previews, localhost) is noindex. Decided
// per request from the Host header, so no hosting setting can be forgotten.
export const PRODUCTION_HOSTS = ["alsaqrsteels.com", "www.alsaqrsteels.com"];
export const isProductionHost = (host: string | null | undefined) =>
  !!host && PRODUCTION_HOSTS.includes(host.split(":")[0].toLowerCase());

// Arabic UI is prepared but hidden until reviewed translations exist.
export const ARABIC_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ARABIC === "true";

export const UPLOAD_LIMITS = {
  maxFiles: 5,
  maxFileBytes: 10 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
  accept: "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png",
  types: ["application/pdf", "image/jpeg", "image/png"] as const,
};

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/quality", label: "Quality" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
