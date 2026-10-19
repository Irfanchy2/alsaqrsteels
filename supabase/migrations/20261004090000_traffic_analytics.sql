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
  if p_name not in ('enquiry_submitted', 'contact_click', 'quote_start', 'assistant_open', 'assistant_handoff', 'page_view') then
    return;
  end if;
  if p_props ? 'channel' then v_props := v_props || jsonb_build_object('channel', left(p_props->>'channel', 20)); end if;
  if p_props ? 'service' then v_props := v_props || jsonb_build_object('service', left(p_props->>'service', 60)); end if;
  if p_props ? 'source' then v_props := v_props || jsonb_build_object('source', left(p_props->>'source', 30)); end if;
  if p_props ? 'ref' then v_props := v_props || jsonb_build_object('ref', left(p_props->>'ref', 80)); end if;
  if p_props ? 'device' then v_props := v_props || jsonb_build_object('device', left(p_props->>'device', 10)); end if;
  if p_props ? 'country' then v_props := v_props || jsonb_build_object('country', left(p_props->>'country', 2)); end if;
  if p_props ? 'new' then v_props := v_props || jsonb_build_object('new', true); end if;
  insert into public.analytics_events (name, path, props)
  values (p_name, left(split_part(coalesce(p_path, ''), '?', 1), 200), v_props);
end;
$$;

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);

create or replace function public.admin_traffic(p_since timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with pv as (
    select path, props, (created_at at time zone 'Asia/Dubai')::date as d
    from public.analytics_events
    where name = 'page_view' and created_at >= p_since
  )
  select jsonb_build_object(
    'views', (select count(*) from pv),
    'visits', (select count(*) from pv where props ? 'new'),
    'daily', coalesce((select jsonb_agg(x order by x.d) from (
      select d, count(*) as views, count(*) filter (where props ? 'new') as visits from pv group by d) x), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(x) from (
      select coalesce(nullif(path, ''), '/') as k, count(*) as n from pv group by 1 order by n desc limit 10) x), '[]'::jsonb),
    'refs', coalesce((select jsonb_agg(x) from (
      select coalesce(props->>'ref', 'Direct / unknown') as k, count(*) as n from pv where props ? 'new' group by 1 order by n desc limit 8) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(x) from (
      select coalesce(props->>'device', 'unknown') as k, count(*) as n from pv where props ? 'new' group by 1 order by n desc) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(x) from (
      select coalesce(props->>'country', '??') as k, count(*) as n from pv where props ? 'new' group by 1 order by n desc limit 8) x), '[]'::jsonb)
  );
$$;
revoke all on function public.admin_traffic(timestamptz) from public;
grant execute on function public.admin_traffic(timestamptz) to authenticated;