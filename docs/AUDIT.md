# Website audit, sitemap and design direction

Prepared 26 September 2026 for Al Saqr Al Ahmar Welding and Blacksmith LLC.

## 1. What exists today

| Asset | Where | Notes |
|---|---|---|
| Live site | alsaqrsteels.com (Hostinger, static HTML) | Nine "projects", four "certifications", seven client logos, quote form posting to a PHP script. |
| Next.js app | this repository, deployed to `alsaqr-steels.vercel.app` | Next.js 16, Supabase, Tailwind 4. Block-based pages, basic admin (leads only). |
| Supabase | project `ajurellftenxollyfahb` | Content tables, `leads`, public `media` bucket. |
| Old WordPress | backup database only | The media library (the original workshop photos) is **not** in the backups found. |

## 2. Findings that change what can be published

1. **ISO certificates belong to another company.** `cert-9001.jpg`, `cert-14001.jpg` and `cert-45001.jpg` are issued to *Capital Zone Inspection & Calibration Services* (Mussafah M-17) and expired on 3 June 2023. They cannot be shown as Al Saqr Al Ahmar certifications.
2. **ICV certificate has lapsed.** `cert-icv.png` is in the company's name (certificate 137849, 21.73 %, licence CN-1058998) but is marked valid until 24 January 2026.
3. **Project photos are not project photos.** `proj-1.jpg` … `proj-9.jpg` are landmark or tourism images (mountain scenery, the Burj Vista tower, a zip-line rider). Only `hero.jpg` and `about.jpg` show fabricated steelwork.
4. **Two "projects" were never awarded.** Al Habtoor City and Hatta Zip Line are marked `waiting_po` in the live site's own data.
5. **Unverified numbers.** "15+ years", "3×ISO", "ICV certified" and "2 onshore & offshore scope" appear as headline stats. The only one supported by a document is the establishment year (2010, per the company's own copy).
6. **Conflicting contact details.** Email `quotes@alsaqrsteels.com` (live site) vs `info@alsaqrsteels.com` (database default). Hours "Saturday to Thursday" (settings) vs "Sunday to Thursday" (structured data).
7. **Security.** Every Supabase policy grants full write access to *any* signed-in user, and quote attachments were uploaded into the *public* `media` bucket.
8. **Copy provenance.** Several passages on the current site (welding process lists, "third-party NDT", "heat-number traceability", industries list) were written during earlier redesigns and are not backed by company material. They have been left out.

## 3. Content used

Only material traceable to the company: the original service lists, the "established in 2010" company description, address, phone numbers, WhatsApp number, social links, the nine project names and statuses from the live site, and the two workshop photographs. Everything else is in `docs/CHECKLIST.md` for confirmation.

## 4. Sitemap

```
/                              Home
/about                         Company and workshop
/services                      Services overview
/services/steel-structures
/services/pipeline-welding
/services/laser-cnc-cutting
/services/storage-containers
/services/stainless-steel
/projects                      Portfolio (filter by service, sector, status)
/projects/[slug]               Project detail (7 published)
/quality                       Quality and certifications
/quote                         Request a quote   (?service= preselects)
/quote/submitted               Confirmation (reference number)
/contact                       Contact, map link, WhatsApp
/privacy  /terms               Legal
/blog  /blog/[slug]            Existing technical notes (footer only)
/admin/...                     Staff CMS (not indexed)
```

Old URLs (`/about.html`, `/services.html`, `/projects.html`, `/certifications.html`, `/contact.html`, `/privacy-policy.html`, `/blog.html`, `/certifications`, `/privacy-policy`, `/industries`, `/careers`) redirect permanently.

## 5. Design direction — "workshop drawing"

- **Palette** tuned to the logo's red gear (sampled `#BC2024`): graphite `#151A20`, warm white `#F6F5F1`, steel grey `#727B84`, accent red `#B8232B`, logo green `#0C5A38` for confirmations only.
- **Type**: Archivo (variable width) for display, IBM Plex Sans for text, IBM Plex Mono for labels and numbers. IBM Plex Sans Arabic is bundled for the RTL version.
- **Layout**: a 12-column grid with visible hairline rules, numbered service rows, and project "title blocks" styled after engineering drawing sheets. Large photographs where genuine ones exist; line-drawing illustrations of each service elsewhere, never stand-in stock photos.
- **Colour use**: light sections by default, graphite for the hero, process and closing sections; red only on primary actions, index numbers and rules.
- **Motion**: short fade/rise on scroll, disabled under `prefers-reduced-motion`. No hero video (no suitable footage supplied).
