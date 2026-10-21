import type { NextConfig } from "next";

// Public defaults, so a host with no environment variables configured (e.g. a
// fresh Hostinger Node.js app) still builds and runs. These are the same
// browser-safe values as .env.local.example; anything set on the host wins.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ajurellftenxollyfahb.supabase.co";
const PUBLIC_DEFAULTS = {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_wZ3tx4ZXlWG585K_8CaObA_OJofFRrm",
  NEXT_PUBLIC_MEDIA_BASE: process.env.NEXT_PUBLIC_MEDIA_BASE ?? `${SUPABASE_URL}/storage/v1/object/public/media`,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://alsaqrsteels.com",
};
// Server code reads process.env directly at runtime, so fill the same gaps there.
for (const [k, v] of Object.entries(PUBLIC_DEFAULTS)) process.env[k] ??= v;

const supabaseHost = new URL(SUPABASE_URL).hostname;

const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: PUBLIC_DEFAULTS,
  // Shared build servers (Hostinger) cap processes and memory: build with one
  // worker so static generation never needs more than the host allows.
  experimental: { cpus: 1, webpackBuildWorker: false },
  images: {
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Photos and documents uploaded through the CMS (public "media" bucket).
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
  },
  async redirects() {
    // URLs from the previous static/PHP website.
    return [
      // Browsers ask for /favicon.ico on their own; serve the site icon.
      { source: "/favicon.ico", destination: "/icon.png", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/about.php", destination: "/about", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/services.php", destination: "/services", permanent: true },
      { source: "/projects.html", destination: "/projects", permanent: true },
      { source: "/projects.php", destination: "/projects", permanent: true },
      { source: "/certifications.html", destination: "/quality", permanent: true },
      { source: "/certifications.php", destination: "/quality", permanent: true },
      { source: "/certifications", destination: "/quality", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/contact.php", destination: "/contact", permanent: true },
      { source: "/privacy-policy.html", destination: "/privacy", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/privacy-policy/", destination: "/privacy", permanent: true },
      { source: "/careers", destination: "/contact", permanent: true },
      { source: "/careers/", destination: "/contact", permanent: true },
      { source: "/industries", destination: "/services", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/blog-page-2.html", destination: "/blog", permanent: true },
      { source: "/blog/:slug.html", destination: "/blog/:slug", permanent: true },
      { source: "/blog-post.php", destination: "/blog", permanent: true },
    ];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    ];
    return [
      {
        source: "/:path*",
        headers: indexable ? security : [...security, { key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
