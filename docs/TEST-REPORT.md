# Test report

Run: 27 September 2026 (after the "yard" visual redesign), production build (`next build` + `next start`), offline content mode (`CONTENT_SOURCE=seed`) with the mock enquiry backend. Headless Chromium via Playwright (`scripts/e2e.mjs`). Raw results: `docs/test-report-local.json`.

**Result: 347 of 347 checks passed.**

## What was checked

16 pages × 3 viewports (390 px phone, 820 px tablet, 1440 px desktop), each for: loads with HTTP 200, no horizontal overflow, exactly one `<h1>`, every image has alt text, no broken images, no console errors (288 checks).

Per page (16 each): unique title and meta description; canonical URL.

Journeys and behaviour:

- Mobile menu opens, navigates, no errors; skip link is the first focusable element.
- With reduced motion on, no content stays hidden.
- Project filters narrow the list and clear again (URL-synced).
- WhatsApp button opens a review dialog where the message can be edited before leaving the site.
- Assistant identifies itself as AI and shows a usable state (offline notice when no key is set).
- Quote form: service preselected from `?service=`; empty submit shows an error summary and moves focus to it; invalid email caught; `.exe` rejected; >10 MB file rejected; valid PDF uploads with progress to "Uploaded"; submission returns a reference; confirmation lists the attachment; visiting the confirmation page without a valid reference shows no false success.
- 30 internal links resolve; old URLs (`/about.html`, `/contact.html`, `/certifications.html`, `/privacy-policy`) redirect with 308; unknown URL returns a real 404 page.
- `robots.txt` disallows everything and every response carries `X-Robots-Tag: noindex` on staging; `sitemap.xml` present.
- Production build and TypeScript check pass with no errors.

## Not yet tested — be aware

- **Live enquiry path on the preview** (Vercel → Supabase edge function → private storage). The edge function and database were exercised during development, but the end-to-end run on the deployed preview must be done from a browser; this sandbox cannot reach `*.vercel.app`.
- **Email delivery** — not configured yet (no Resend key), so notifications record "not configured".
- **AI assistant answers** — no API key is set; only the offline state was tested.
- **Lighthouse / Core Web Vitals** were not measured. The build is designed for it (static pages, self-hosted fonts, responsive AVIF/WebP images, no third-party scripts by default), but no score is claimed until measured on the preview.
- **Screen-reader testing** with VoiceOver/NVDA was not done; automated checks and keyboard paths only.
- Older browsers (Safari < 16) not tested.
