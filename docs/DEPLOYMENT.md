# Deployment

The site runs on **Vercel** (project `alsaqr-steels`) with **Supabase** (project `ajurellftenxollyfahb`) for content, enquiries, files and staff sign-in. The current live site at alsaqrsteels.com (Hostinger) is **not touched** until you approve the switch.

## 1. Staging preview (now)

Preview deployments get a `*.vercel.app` URL, send `noindex` on every response and block all crawlers in `robots.txt`.

Vercel environment variables for **Preview**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ajurellftenxollyfahb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key |
| `NEXT_PUBLIC_MEDIA_BASE` | `https://ajurellftenxollyfahb.supabase.co/storage/v1/object/public/media` |
| `ENQUIRY_FUNCTION_SECRET` | (Sensitive) matches `app_config.enquiry_function_secret` |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `false` |

Review on the preview: every page on phone and desktop, a real quote with a PDF attached (check it appears in `/admin/enquiries` with its reference), the WhatsApp and call buttons, and the CMS.

## 2. Go-live checklist

1. Items 1–7 in `CHECKLIST.md` resolved (at minimum: a staff account, the enquiry mailbox and email alerts).
2. Promote the approved preview to production in Vercel (Deployments → ⋯ → Promote).
3. Production environment variables: as above plus `NEXT_PUBLIC_SITE_URL=https://alsaqrsteels.com` and `NEXT_PUBLIC_SITE_INDEXABLE=true`. Optional: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_VERCEL_ANALYTICS=true`.
4. Vercel → Project → Domains → add `alsaqrsteels.com` and `www.alsaqrsteels.com` (redirect www → apex).
5. At Hostinger DNS, set the records Vercel shows (typically `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`). **Leave MX and email records unchanged** so company email keeps working. Lower the TTL a day beforehand.
6. After DNS resolves: check HTTPS, submit one test enquiry, confirm the email arrives, and submit `https://alsaqrsteels.com/sitemap.xml` in Google Search Console.
7. Old URLs (`/about.html`, `/services.html`, `/projects.html`, `/contact.html`, `/certifications.html`, `/privacy-policy.html`, `/blog.html` and their `.php` versions) redirect permanently, so existing links and search results keep working.

## Rollback

Vercel keeps every deployment: Deployments → previous one → **Promote**. If the domain itself needs to go back, restore the Hostinger DNS records (keep a screenshot of them before step 5). The Hostinger files are untouched throughout.

## Updating later

Content changes need no deployment — use the CMS. Code changes: push to the repository (or `vercel deploy`) → review the preview → promote.
