grant execute on function public.next_enquiry_reference() to service_role;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.track_event(text, text, jsonb) to service_role;
