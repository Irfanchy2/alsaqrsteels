-- Dashboard: count events in the database instead of downloading up to 5,000
-- rows to count them in the browser/server. Runs as the caller, so the
-- "staff read events" policy still applies.
create or replace function public.admin_event_counts(p_since timestamptz)
returns table (name text, channel text, n bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.name,
         case when e.name = 'contact_click' then coalesce(e.props->>'channel', 'other') else null end as channel,
         count(*) as n
  from public.analytics_events e
  where e.created_at >= p_since
  group by 1, 2;
$$;
revoke all on function public.admin_event_counts(timestamptz) from public;
grant execute on function public.admin_event_counts(timestamptz) to authenticated;

-- Indexes behind the admin lists.
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status, created_at desc);
