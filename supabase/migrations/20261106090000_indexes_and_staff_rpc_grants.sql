-- Covering index for the site_content.updated_by foreign key (Supabase
-- performance advisor), and remove signed-out access to the staff-management
-- functions. They already refuse anyone who is not an admin; this stops
-- signed-out visitors from calling them at all.
create index if not exists site_content_updated_by_idx on public.site_content (updated_by);

revoke execute on function public.admin_add_staff(text, text) from anon, public;
revoke execute on function public.admin_remove_staff(uuid) from anon, public;
revoke execute on function public.admin_set_staff_role(uuid, text) from anon, public;
grant execute on function public.admin_add_staff(text, text) to authenticated;
grant execute on function public.admin_remove_staff(uuid) to authenticated;
grant execute on function public.admin_set_staff_role(uuid, text) to authenticated;
