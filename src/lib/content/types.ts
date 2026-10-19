// Public content model. Mirrors the Supabase tables (see supabase/migrations)
// and the local seed in ./seed.ts, which is used for offline builds and tests.

export type Company = {
  name: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  establishedYear: number | null;
  address: string;
  phones: { display: string; e164: string }[];
  whatsapp: string | null; // digits only, e.g. 971559270303
  email: string | null;
  hours: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  mapsUrl: string | null;
  logoUrl: string;
};

export type Service = {
  slug: string;
  number: string; // "01"
  title: string;
  summary: string;
  intro: string;
  scope: string[];
  applications: string[];
  illustration: IllustrationKey;
  image: ImageRef | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type IllustrationKey = "ibeam" | "pipe" | "cnc" | "tank" | "rail" | "gate" | "stair" | "canopy";

export type ImageRef = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ProjectStatus = "completed" | "ongoing";

export type Project = {
  slug: string;
  code: string;
  title: string;
  location: string;
  emirate: string;
  sector: string;
  status: ProjectStatus;
  scope: string;
  description: string;
  services: string[]; // service slugs
  clientName: string | null; // only set when the client may be named publicly
  year: string | null;
  featured: boolean;
  images: ImageRef[];
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  scope: string; // "general" | "quote" | service slug
};

export type Highlight = { label: string; value: string; detail: string | null };

export type ProcessStep = { title: string; body: string };

export type Certification = {
  id: string;
  title: string;
  standard: string | null;
  issuer: string | null;
  certificateNumber: string | null;
  validUntil: string | null; // ISO date
  image: ImageRef | null;
  fileUrl: string | null;
};

export type CompanyDocument = {
  id: string;
  title: string;
  kind: "company_profile" | "certificate" | "other";
  fileUrl: string;
  fileSize: number | null;
};

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  image: string | null;
  tags: string[];
  author: string | null;
  readingMinutes: number;
};

export type BlogPost = BlogPostSummary & {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type ClientLogo = { name: string; logo: ImageRef };
