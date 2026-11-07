-- Announcement bar: messages shown in a slim bar above the site header.
-- Managed by admins in Admin > Announcement bar. Visitors can read only
-- published, enabled rows; the site decides on each page which of those are
-- inside their dates (UAE time), so expired ones disappear by themselves.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 300),
  emoji text check (emoji is null or char_length(emoji) <= 8),
  link_url text check (link_url is null or (char_length(link_url) <= 500 and (link_url ~ '^/[^/]' or link_url = '/' or link_url ~ '^https://'))),
  cta_text text check (cta_text is null or char_length(cta_text) <= 40),
  bg_color text not null default '#111111' check (bg_color ~ '^#[0-9a-fA-F]{6}$'),
  text_color text not null default '#ffffff' check (text_color ~ '^#[0-9a-fA-F]{6}$'),
  font_size smallint not null default 13 check (font_size between 10 and 18),
  height_desktop smallint not null default 30 check (height_desktop between 24 and 56),
  height_mobile smallint not null default 32 check (height_mobile between 24 and 56),
  speed smallint not null default 30 check (speed between 8 and 120),
  direction text not null default 'left' check (direction in ('left', 'right')),
  animation text not null default 'marquee' check (animation in ('marquee', 'fade', 'static')),
  starts_at timestamptz,
  ends_at timestamptz,
  recurrence text not null default 'none' check (recurrence in ('none', 'yearly')),
  enabled boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published')),
  priority integer not null default 0 check (priority between -100 and 100),
  override_auto boolean not null default false,
  kind text not null default 'custom' check (kind in ('custom', 'celebration')),
  template_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (recurrence = 'none' or (starts_at is not null and ends_at is not null))
);

create index if not exists announcements_live_idx on public.announcements (status, enabled);
create index if not exists announcements_updated_by_idx on public.announcements (updated_by);

alter table public.announcements enable row level security;

drop policy if exists "public reads live announcements" on public.announcements;
create policy "public reads live announcements" on public.announcements
  for select to anon, authenticated
  using (status = 'published' and enabled);

drop policy if exists "admins manage announcements" on public.announcements;
create policy "admins manage announcements" on public.announcements
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- Built-in UAE celebration templates (UAE time, +04:00). Gregorian dates
-- repeat every year; Eid dates follow the moon, so they start as drafts with
-- no dates for an admin to set each year. Every field stays editable.
-- {year} = year of the occasion, {anniversary} = e.g. "55th" (from 1971).
insert into public.announcements
  (title, message, emoji, bg_color, text_color, starts_at, ends_at, recurrence, status, priority, kind, template_key, animation)
values
  ('UAE Flag Day', 'Happy UAE Flag Day! Proudly raising the flag with the nation.', '🇦🇪', '#00732f', '#ffffff',
   '2026-11-03 00:00+04', '2026-11-03 23:59+04', 'yearly', 'published', 10, 'celebration', 'flag-day', 'marquee'),
  ('UAE Commemoration Day', 'Commemoration Day: we honour the sacrifices of the UAE''s martyrs.', '🕊️', '#1f2937', '#ffffff',
   '2026-11-30 00:00+04', '2026-11-30 23:59+04', 'yearly', 'published', 10, 'celebration', 'commemoration-day', 'static'),
  ('UAE National Day / Eid Al Etihad', 'Happy {anniversary} UAE National Day! Eid Al Etihad {year} greetings from Al Saqr Al Ahmar.', '🇦🇪', '#00732f', '#ffffff',
   '2026-12-01 00:00+04', '2026-12-03 23:59+04', 'yearly', 'published', 20, 'celebration', 'national-day', 'marquee'),
  ('New Year', 'Happy New Year {year} from everyone at Al Saqr Al Ahmar!', '🎉', '#111111', '#ffb347',
   '2026-12-31 18:00+04', '2027-01-01 23:59+04', 'yearly', 'published', 10, 'celebration', 'new-year', 'marquee'),
  ('Eid Al Fitr', 'Eid Al Fitr Mubarak! Wishing you and your family peace and happiness.', '🌙', '#0b3d2e', '#f5d48b',
   null, null, 'none', 'draft', 15, 'celebration', 'eid-al-fitr', 'marquee'),
  ('Eid Al Adha', 'Eid Al Adha Mubarak! Warm wishes from Al Saqr Al Ahmar.', '🌙', '#0b3d2e', '#f5d48b',
   null, null, 'none', 'draft', 15, 'celebration', 'eid-al-adha', 'marquee')
on conflict (template_key) do nothing;

-- Bar-wide settings live in site_content ("announcement:settings").
insert into public.site_content (key, data)
values ('announcement:settings', '{"enabled": true, "mode": "marquee", "interval": 6}'::jsonb)
on conflict (key) do nothing;
