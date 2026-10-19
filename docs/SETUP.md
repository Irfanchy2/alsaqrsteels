# Setup

## Requirements

Node.js 20.9 or later, npm, and access to the Supabase project `ajurellftenxollyfahb` and the Vercel project `alsaqr-steels`.

## Run locally

```bash
npm install
cp .env.local.example .env.local      # then fill in ENQUIRY_FUNCTION_SECRET
npm run dev                           # http://localhost:3000
```

Offline mode (no Supabase, fake enquiry backend — used by the automated tests):

```bash
CONTENT_SOURCE=seed ENQUIRY_MOCK=1 npm run dev
```

Useful scripts:

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run test:e2e` | Browser journeys and page checks (`BASE_URL=` to target another server) |
| `npm run screenshots -- / /services 390` | Full-page screenshots into `test-results/shots` |
| `npm run seed:sql` | Regenerate `supabase/seed/content.sql` from `src/lib/content/seed.ts` |

## Environment variables

See `.env.local.example` for the full annotated list. In Vercel, set them under Project → Settings → Environment Variables. `ENQUIRY_FUNCTION_SECRET` and `ANTHROPIC_API_KEY` must be marked **Sensitive** and never prefixed `NEXT_PUBLIC_`.

## Database

Migrations live in `supabase/migrations` and have already been applied to the project. To apply them to a fresh project:

```bash
supabase link --project-ref <ref>
supabase db push
psql "$DATABASE_URL" -f supabase/seed/content.sql
```

Security model: every table has row-level security. The public can only read published content and can never read enquiries. Staff rights come from the `public.staff` table through the `is_staff()` function. Enquiry attachments go to the private `enquiry-files` bucket, readable only by staff via 10-minute signed links.

### Give someone CMS access (required once)

1. Supabase → Authentication → Users → **Add user** (email + password; they sign in at `/admin/login`). Turn off public sign-ups under Authentication → Providers → Email.
2. In the SQL editor, run (with the real addresses):

```sql
insert into public.staff (user_id, email, role)
select id, email, 'admin' from auth.users
where email in ('owner@example.com')
on conflict do nothing;
```

To remove access: `delete from public.staff where email = '...';`

## Edge functions

| Function | Purpose |
|---|---|
| `submit-enquiry` | Validates and stores quote requests, issues signed upload URLs, checks file types by content, assigns `ASQ-YYYY-#####` references, rate-limits, sends the staff email. Called only by the website server with the shared secret. |
| `import-site-media` | One-off utility that copied the two workshop photographs and the logo from the old site into the `media` bucket. Can be deleted once the new site is live. |

Deploy: `supabase functions deploy submit-enquiry --no-verify-jwt`.

### Email notifications

Until these are set, enquiries are stored normally and show "Email not configured" in the CMS — no enquiry is lost.

```bash
supabase secrets set RESEND_API_KEY=re_... \
  NOTIFY_EMAIL_TO=quotes@alsaqrsteels.com \
  NOTIFY_EMAIL_FROM="Al Saqr Website <website@alsaqrsteels.com>"
```

The sending domain must be verified in Resend (add the DNS records it gives you at Hostinger). Failed sends are marked **failed** on the enquiry with the error, and staff can press **Retry email**.

## AI assistant

Set `ANTHROPIC_API_KEY` in Vercel. Without it the assistant button does not appear and the quote form works exactly the same. Limits: 24 messages of history per conversation, 1,000 characters per message, 20 requests per visitor per 10 minutes, 120 per visitor per day, and a site-wide daily cap (`ASSISTANT_DAILY_CAP`, default 1,500). It answers only from the published site content and never gives prices, delivery dates or engineering decisions.
