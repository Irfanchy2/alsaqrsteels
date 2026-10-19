-- "Trusted by" client logo strip on the home page, managed from /admin/clients.
-- Logos below are the ones already published on the current alsaqrsteels.com.
create table if not exists public.client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  width integer,
  height integer,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_logos enable row level security;
drop policy if exists "public reads published client logos" on public.client_logos;
create policy "public reads published client logos" on public.client_logos
  for select to anon, authenticated using (published);
drop policy if exists "staff manage client logos" on public.client_logos;
create policy "staff manage client logos" on public.client_logos
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
grant select on public.client_logos to anon, authenticated;
grant insert, update, delete on public.client_logos to authenticated;

insert into public.client_logos (name, logo_url, width, height, sort_order)
select * from (values
  ('ADNOC', '/images/clients/adnoc.webp', 270, 120, 10),
  ('Emaar', '/images/clients/emaar.webp', 360, 72, 20),
  ('GASCO', '/images/clients/gasco.webp', 320, 82, 30),
  ('SDIC', '/images/clients/sdic.webp', 320, 114, 40),
  ('Takreer', '/images/clients/takreer.webp', 206, 120, 50),
  ('Trane', '/images/clients/trane.webp', 360, 73, 60),
  ('Mada International', '/images/clients/mada.webp', 320, 95, 70)
) as v(name, logo_url, width, height, sort_order)
where not exists (select 1 from public.client_logos);
