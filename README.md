# Al Saqr Al Ahmar — website (2026 "Forge" redesign)

Company website and staff CMS for Al Saqr Al Ahmar Welding and Blacksmith LLC, Musaffah, Abu Dhabi.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, Edge Functions) · Vercel.

## Documentation

| File | For |
|---|---|
| `docs/AUDIT.md` | What was found on the old site, sitemap, design direction |
| `docs/SETUP.md` | Local setup, environment variables, database, staff access, email, AI assistant |
| `docs/CONTENT-GUIDE.md` | How staff edit content and handle enquiries |
| `docs/CHECKLIST.md` | Missing assets, credentials and facts to confirm (private) |
| `docs/TEST-REPORT.md` | Automated test results and what is not yet tested |
| `docs/HOSTINGER-DEPLOY.md` | **GitHub → Hostinger auto-deploy (current setup)** |
| `docs/DEPLOYMENT.md` | Original Vercel staging / go-live notes |

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Layout

```
src/app/(site)/          public pages (home, about, services, projects, quality, quote, contact, legal, blog)
src/app/admin/           staff CMS (login, enquiries, projects, services, FAQs, certifications, documents, settings)
src/app/api/             quote upload/submit bridge, AI assistant, privacy-safe event tracking
src/app/og.png/          generated social sharing image
src/components/ui/       design-system pieces (illustrations, headings, breadcrumbs, FAQ, cards)
src/components/site/     header, footer, mobile contact bar, WhatsApp review dialog, JSON-LD
src/components/quote/    quote form with validated attachments
src/components/assistant/ Al Saqr Project Assistant
src/lib/content/         content types, seed content, data access (Supabase or seed)
supabase/migrations/     schema, RLS policies, storage buckets
supabase/functions/      submit-enquiry (+ one-off import-site-media)
scripts/                 e2e tests, screenshots, seed SQL generator
```

Legacy files from the previous build (`src/components/Block*.tsx`, `Header.tsx`, `lib/data.ts` …) are excluded from compilation in `tsconfig.json` and can be deleted.
