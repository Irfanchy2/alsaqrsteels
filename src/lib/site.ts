// Deployment-level settings. Business facts live in the CMS (site_settings);
// only technical switches belong here.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

// Search engines are kept out unless this is explicitly switched on for the
// real domain. Staging and preview deployments stay noindex.
export const INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

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
