import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "ajurellftenxollyfahb.supabase.co";

const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
