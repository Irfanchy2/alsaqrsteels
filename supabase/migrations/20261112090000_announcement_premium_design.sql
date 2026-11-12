-- Premium celebration banner: per-announcement design settings (theme, size,
-- subtitle, background photo, opacity, blur, flag icons, underline) stored as
-- JSON and checked by the app (src/lib/announcements.ts readDesign).
alter table public.announcements add column if not exists design jsonb not null default '{}'::jsonb;

-- Premium banners are taller than the slim bar.
alter table public.announcements drop constraint if exists announcements_height_desktop_check;
alter table public.announcements drop constraint if exists announcements_height_mobile_check;
alter table public.announcements add constraint announcements_height_desktop_check check (height_desktop between 24 and 72);
alter table public.announcements add constraint announcements_height_mobile_check check (height_mobile between 24 and 72);

-- Built-in UAE celebrations use the premium dark banner. Only templates no
-- admin has edited yet (updated_by is null) are changed.
update public.announcements set
  message = 'Happy {anniversary} UAE National Day',
  emoji = null,
  bg_color = '#102b25', text_color = '#ffffff', font_size = 15,
  height_desktop = 56, height_mobile = 48, animation = 'fade',
  design = '{"style":"premium","theme":"dark","size":"premium","subtitle":"Celebrating the Spirit of the Union · Al Saqr Steels","subtext_color":"#d0e2d7","image_opacity":17,"image_blur":3,"flag_icons":true,"underline":true}'::jsonb
where template_key = 'national-day' and updated_by is null;

update public.announcements set
  message = 'Happy UAE Flag Day',
  emoji = null,
  bg_color = '#102b25', text_color = '#ffffff', font_size = 15,
  height_desktop = 56, height_mobile = 48, animation = 'fade',
  design = '{"style":"premium","theme":"dark","size":"premium","subtitle":"Proudly raising the flag with the nation · Al Saqr Steels","subtext_color":"#d0e2d7","image_opacity":17,"image_blur":3,"flag_icons":true,"underline":true}'::jsonb
where template_key = 'flag-day' and updated_by is null;

update public.announcements set
  message = 'Commemoration Day',
  emoji = null,
  bg_color = '#102b25', text_color = '#ffffff', font_size = 15,
  height_desktop = 56, height_mobile = 48, animation = 'fade',
  design = '{"style":"premium","theme":"dark","size":"premium","subtitle":"Honouring the sacrifices of the UAE''s martyrs","subtext_color":"#d0e2d7","image_opacity":12,"image_blur":4,"flag_icons":false,"underline":true}'::jsonb
where template_key = 'commemoration-day' and updated_by is null;

update public.announcements set
  message = 'Happy New Year {year}',
  bg_color = '#102b25', text_color = '#ffffff', font_size = 15,
  height_desktop = 56, height_mobile = 48, animation = 'fade',
  design = '{"style":"premium","theme":"dark","size":"premium","subtitle":"Best wishes from everyone at Al Saqr Steels","subtext_color":"#d0e2d7","image_opacity":12,"image_blur":3,"flag_icons":false,"underline":true}'::jsonb
where template_key = 'new-year' and updated_by is null;

update public.announcements set
  message = case template_key when 'eid-al-fitr' then 'Eid Al Fitr Mubarak' else 'Eid Al Adha Mubarak' end,
  bg_color = '#102b25', text_color = '#ffffff', font_size = 15,
  height_desktop = 56, height_mobile = 48, animation = 'fade',
  design = '{"style":"premium","theme":"dark","size":"premium","subtitle":"Warm wishes to you and your family · Al Saqr Steels","subtext_color":"#d0e2d7","image_opacity":12,"image_blur":3,"flag_icons":false,"underline":true}'::jsonb
where template_key in ('eid-al-fitr', 'eid-al-adha') and updated_by is null;
