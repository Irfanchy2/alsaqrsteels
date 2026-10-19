# Admin setup (one time, about 3 minutes)

## 1. Create your login
Supabase → **Authentication → Users → Add user** → your email and a password.
(Skip if you already have one.)

## 2. Run the database update and make yourself Admin
Supabase → **SQL Editor → New query**. Paste the whole of
`supabase/migrations/20261020090000_site_content_team.sql` (from the GitHub repo),
then add these lines at the end with **your** email, and click **Run**:

```sql
insert into public.staff (user_id, email, role)
select id, email, 'admin' from auth.users where lower(email) = lower('your-email@example.com')
on conflict (user_id) do update set role = 'admin';
```

The update only **adds** one table (`site_content`) and four team functions.
No existing table or data is changed.

## 3. Sign in
https://alsaqrsteels.com/admin

## What you can edit

| Menu | What it does |
|---|---|
| Pages & sections | Every page's sections: headings, text, buttons, photos; show or hide each section |
| Projects & photos / Services / Blog / FAQs | The content lists |
| Company details | Phones, address, hours, home headline, About text, highlights, process steps |
| Client logos / Certifications / Documents | As named |
| Motion & effects *(Admin)* | Animations on/off, speed 0.5×–2×, and each effect on its own |
| Team & roles *(Admin)* | Add people by email, set Admin or Editor, remove |

**Roles:** Admin = everything. Editor = all content and enquiries, but not Team or Motion.
To add someone: create their login in Supabase (step 1), then add the email under Team & roles.
