-- =====================================================================
-- Redesign 2026: staff-only CMS access, richer content model, private
-- enquiry pipeline, rate limiting and privacy-safe analytics.
-- =====================================================================

-- ---------- Staff allowlist ------------------------------------------
create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s where s.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

drop policy if exists "staff read staff" on public.staff;
create policy "staff read staff" on public.staff
  for select to authenticated using ((select public.is_staff()));

-- ---------- Replace "any signed-in user" write policies ----------------
drop policy if exists "admin all posts" on public.blog_posts;
drop policy if exists "admin all certs" on public.certifications;
drop policy if exists "admin all industries" on public.industries;
drop policy if exists "admin all blocks" on public.page_blocks;
drop policy if exists "admin all pages" on public.pages;
drop policy if exists "admin all partners" on public.partners;
drop policy if exists "admin all projects" on public.projects;
drop policy if exists "admin all services" on public.services;
drop policy if exists "admin all settings" on public.site_settings;
drop policy if exists "admin all quotes" on public.testimonials;

do $$
declare
  t text;
begin
  foreach t in array array[
    'blog_posts', 'certifications', 'industries', 'page_blocks', 'pages',
    'partners', 'projects', 'services', 'site_settings', 'testimonials'
  ] loop
    execute format(
      'create policy "staff manage %1$s" on public.%1$I for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))',
      t
    );
  end loop;
end $$;

-- Legacy leads table: staff only, no anonymous inserts (the enquiry
-- pipeline below replaces it).
drop policy if exists "anyone submits a lead" on public.leads;
drop policy if exists "admin reads leads" on public.leads;
drop policy if exists "admin updates leads" on public.leads;
drop policy if exists "admin deletes leads" on public.leads;
create policy "staff manage leads" on public.leads
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Storage ---------------------------------------------------
drop policy if exists "visitor uploads rfq" on storage.objects;
drop policy if exists "admin uploads media" on storage.objects;
drop policy if exists "admin updates media" on storage.objects;
drop policy if exists "admin deletes media" on storage.objects;

create policy "staff uploads media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_staff()));
create policy "staff updates media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_staff()));
create policy "staff deletes media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_staff()));

update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
where id = 'media';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enquiry-files', 'enquiry-files', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "staff reads enquiry files" on storage.objects
  for select to authenticated using (bucket_id = 'enquiry-files' and (select public.is_staff()));
create policy "staff deletes enquiry files" on storage.objects
  for delete to authenticated using (bucket_id = 'enquiry-files' and (select public.is_staff()));

-- ---------- Site settings --------------------------------------------
alter table public.site_settings
  add column if not exists established_year integer;

-- ---------- Services -------------------------------------------------
alter table public.services
  add column if not exists number text,
  add column if not exists intro text,
  add column if not exists applications text[] not null default '{}',
  add column if not exists illustration text,
  add column if not exists image_alt text,
  add column if not exists image_width integer,
  add column if not exists image_height integer,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists updated_at timestamptz not null default now();

-- ---------- Projects -------------------------------------------------
alter table public.projects
  add column if not exists slug text,
  add column if not exists code text,
  add column if not exists status text,
  add column if not exists emirate text,
  add column if not exists services text[] not null default '{}',
  add column if not exists client_name text,
  add column if not exists client_public boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.projects add constraint projects_slug_key unique (slug);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.projects add constraint projects_status_check
    check (status is null or status in ('completed', 'ongoing'));
exception when duplicate_object then null; end $$;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  alt text not null default '',
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);
alter table public.project_images enable row level security;
create policy "public reads images of published projects" on public.project_images
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "staff manage project images" on public.project_images
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- FAQs, highlights, process, documents ---------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'general',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create policy "public reads published faqs" on public.faqs
  for select to anon, authenticated using (published);
create policy "staff manage faqs" on public.faqs
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  detail text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.highlights enable row level security;
create policy "public reads published highlights" on public.highlights
  for select to anon, authenticated using (published);
create policy "staff manage highlights" on public.highlights
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.process_steps enable row level security;
create policy "public reads published steps" on public.process_steps
  for select to anon, authenticated using (published);
create policy "staff manage steps" on public.process_steps
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'other' check (kind in ('company_profile', 'certificate', 'other')),
  file_url text not null,
  file_size integer,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
create policy "public reads published documents" on public.documents
  for select to anon, authenticated using (published);
create policy "staff manage documents" on public.documents
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- Certifications: verification fields ------------------------
alter table public.certifications
  add column if not exists standard text,
  add column if not exists issuer text,
  add column if not exists holder_name text,
  add column if not exists certificate_number text,
  add column if not exists valid_until date,
  add column if not exists verified boolean not null default false,
  add column if not exists staff_note text;

-- Public visitors only ever see certificates that staff have verified and
-- that have not expired.
drop policy if exists "public read certs" on public.certifications;
create policy "public reads verified current certs" on public.certifications
  for select to anon, authenticated
  using (published and verified and (valid_until is null or valid_until >= current_date));

-- ---------- Private configuration (service role only) -----------------
create table if not exists public.app_config (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
-- No policies: readable only with the service role (edge functions).

-- ---------- Enquiries ------------------------------------------------
create sequence if not exists public.enquiry_ref_seq start 1001;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  company text check (company is null or char_length(company) <= 160),
  phone text check (phone is null or char_length(phone) <= 40),
  email text check (email is null or char_length(email) <= 200),
  service text,
  location text check (location is null or char_length(location) <= 200),
  scope text not null check (char_length(scope) between 10 and 5000),
  dimensions text check (dimensions is null or char_length(dimensions) <= 1000),
  quantities text check (quantities is null or char_length(quantities) <= 1000),
  target_date date,
  source text not null default 'quote_form' check (source in ('quote_form', 'assistant')),
  page_path text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quoted', 'won', 'lost', 'closed', 'spam')),
  staff_notes text,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed', 'not_configured')),
  notification_error text,
  notified_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint enquiries_contact_required check (phone is not null or email is not null)
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
alter table public.enquiries enable row level security;
create policy "staff read enquiries" on public.enquiries
  for select to authenticated using ((select public.is_staff()));
create policy "staff update enquiries" on public.enquiries
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff delete enquiries" on public.enquiries
  for delete to authenticated using ((select public.is_staff()));
-- No insert policy: enquiries are written only by the submit-enquiry edge
-- function (service role), after server-side validation.

create table if not exists public.enquiry_files (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);
create index if not exists enquiry_files_enquiry_idx on public.enquiry_files (enquiry_id);
alter table public.enquiry_files enable row level security;
create policy "staff read enquiry files rows" on public.enquiry_files
  for select to authenticated using ((select public.is_staff()));
create policy "staff delete enquiry files rows" on public.enquiry_files
  for delete to authenticated using ((select public.is_staff()));

create or replace function public.next_enquiry_reference()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select 'ASQ-' || to_char(now() at time zone 'Asia/Dubai', 'YYYY') || '-'
         || lpad(nextval('public.enquiry_ref_seq')::text, 5, '0');
$$;
revoke all on function public.next_enquiry_reference() from public, anon, authenticated;

-- ---------- Rate limiting --------------------------------------------
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  if p_key is null or char_length(p_key) > 200 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.hit_rate_limit(text, integer, integer) from public;
grant execute on function public.hit_rate_limit(text, integer, integer) to anon, authenticated;

-- ---------- Privacy-safe analytics ------------------------------------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  path text,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_name_idx on public.analytics_events (name, created_at desc);
alter table public.analytics_events enable row level security;
create policy "staff read events" on public.analytics_events
  for select to authenticated using ((select public.is_staff()));

create or replace function public.track_event(p_name text, p_path text, p_props jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_props jsonb := '{}';
begin
  if p_name not in ('enquiry_submitted', 'contact_click', 'quote_start', 'assistant_open', 'assistant_handoff') then
    return;
  end if;
  -- Keep only non-personal, whitelisted keys with short values.
  if p_props ? 'channel' then v_props := v_props || jsonb_build_object('channel', left(p_props->>'channel', 20)); end if;
  if p_props ? 'service' then v_props := v_props || jsonb_build_object('service', left(p_props->>'service', 60)); end if;
  if p_props ? 'source' then v_props := v_props || jsonb_build_object('source', left(p_props->>'source', 30)); end if;
  insert into public.analytics_events (name, path, props)
  values (p_name, left(split_part(coalesce(p_path, ''), '?', 1), 200), v_props);
end;
$$;
revoke all on function public.track_event(text, text, jsonb) from public;
grant execute on function public.track_event(text, text, jsonb) to anon, authenticated;
