-- =====================================================================
-- Admin 2.0: editable page sections, motion settings, and team roles.
-- Additive only: one new table and a few functions. No existing table,
-- column or row is changed or removed.
-- =====================================================================

-- ---------- Editable page content + site-wide settings ----------------
-- One row per page ("page:home", "page:services", …) and one for motion
-- ("motion"). Values are plain JSON; the website falls back to its built-in
-- text for anything not set.
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.site_content enable row level security;

drop policy if exists "public reads site content" on public.site_content;
create policy "public reads site content" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "staff manage site content" on public.site_content;
create policy "staff manage site content" on public.site_content
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- ---------- Roles ------------------------------------------------------
-- "admin"  = everything, including Team and Motion & effects.
-- "staff"  = Editor: all content, enquiries and pages.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s where s.user_id = (select auth.uid()) and s.role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Add (or re-role) a team member by the email they sign in with. The login
-- itself is created in Supabase → Authentication → Users.
create or replace function public.admin_add_staff(p_email text, p_role text default 'staff')
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_email text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can manage the team.';
  end if;
  if p_role not in ('admin', 'staff') then
    raise exception 'Role must be admin or staff.';
  end if;
  select u.id, u.email into v_id, v_email
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;
  if v_id is null then
    raise exception 'No login exists for %. Create it in Supabase → Authentication → Users first, then add it here.', trim(p_email);
  end if;
  insert into public.staff (user_id, email, role)
  values (v_id, v_email, p_role)
  on conflict (user_id) do update set role = excluded.role, email = excluded.email;
  return v_email;
end;
$$;
revoke all on function public.admin_add_staff(text, text) from public;
grant execute on function public.admin_add_staff(text, text) to authenticated;

create or replace function public.admin_set_staff_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can manage the team.';
  end if;
  if p_role not in ('admin', 'staff') then
    raise exception 'Role must be admin or staff.';
  end if;
  if p_role <> 'admin'
     and exists (select 1 from public.staff where user_id = p_user and role = 'admin')
     and (select count(*) from public.staff where role = 'admin') <= 1 then
    raise exception 'There must always be at least one admin.';
  end if;
  update public.staff set role = p_role where user_id = p_user;
end;
$$;
revoke all on function public.admin_set_staff_role(uuid, text) from public;
grant execute on function public.admin_set_staff_role(uuid, text) to authenticated;

create or replace function public.admin_remove_staff(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can manage the team.';
  end if;
  if p_user = (select auth.uid()) then
    raise exception 'You cannot remove yourself.';
  end if;
  if exists (select 1 from public.staff where user_id = p_user and role = 'admin')
     and (select count(*) from public.staff where role = 'admin') <= 1 then
    raise exception 'There must always be at least one admin.';
  end if;
  delete from public.staff where user_id = p_user;
end;
$$;
revoke all on function public.admin_remove_staff(uuid) from public;
grant execute on function public.admin_remove_staff(uuid) to authenticated;
