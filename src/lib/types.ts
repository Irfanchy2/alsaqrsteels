export type SiteSettings = {
  id: number;
  company_name: string;
  tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image: string | null;
  logo_url: string | null;
  about_title: string | null;
  about_body: string | null;
  address: string | null;
  phone_1: string | null;
  phone_2: string | null;
  whatsapp: string | null;
  email: string | null;
  business_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  maps_url: string | null;
  updated_at: string;
};

export type Service = {
  id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  body: string | null;
  bullets: string[] | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Industry = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  category: string | null;
  sector: string | null;
  location: string | null;
  year: string | null;
  scope: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  featured: boolean;
  published: boolean;
  created_at: string;
};

export type Certification = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  file_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  project_type: string | null;
  description: string | null;
  quantity: string | null;
  dimensions: string | null;
  material: string | null;
  finish: string | null;
  services: string | null;
  location: string | null;
  required_by: string | null;
  files: unknown[];
  source: string;
  status: string;
  notes: string | null;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  nav_label: string;
  nav_order: number;
  show_in_nav: boolean;
  show_in_footer: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type PageBlock = {
  id: string;
  page_id: string;
  block_type: string;
  position: number;
  anchor_id: string | null;
  is_visible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string | null;
  status: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
