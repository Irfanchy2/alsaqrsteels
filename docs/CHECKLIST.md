# Private checklist — missing assets, credentials and facts

Nothing on this list has been guessed on the website. Each item is either hidden or worded so the site is accurate without it.

## Needed before going live

| # | Item | Why it matters | Where it goes |
|---|---|---|---|
| 1 | **Staff accounts** — who should manage enquiries and content | The CMS has no users yet; enquiries are stored but nobody can open them in the CMS | Supabase → Auth, then the SQL in `SETUP.md` |
| 2 | **Enquiry mailbox** — `quotes@` or `info@alsaqrsteels.com`? | The two sites disagree | CMS → Company details, and `NOTIFY_EMAIL_TO` |
| 3 | **Resend account + domain DNS** | Staff email alerts for new enquiries | `SETUP.md` → Email notifications |
| 4 | **Business hours** — Saturday–Thursday or Sunday–Thursday? | Conflicting on the old site; hours are currently not stated in structured data | CMS → Company details |
| 5 | **WhatsApp number** confirmation | Used for the WhatsApp button | CMS → Company details |
| 6 | **Legal review** of Privacy and Terms pages | Drafted plainly for a UAE B2B business; not legal advice | `/privacy`, `/terms` |
| 7 | **Approval to replace alsaqrsteels.com** and DNS access at Hostinger | Staging only until then | `DEPLOYMENT.md` |

## Content to supply or confirm

- **Certificates in the company's own name.** The ISO 9001/14001/45001 images on the old site belong to Capital Zone Inspection & Calibration Services and expired June 2023. ICV certificate 137849 expired 24 January 2026 — upload the renewal.
- **Project photographs** for each of the seven projects (only two genuine workshop photos exist today).
- **Client permissions** before naming any client on a project (ADNOC Onshore for Taweelah is stored privately).
- **Client logo strip** — the home page now shows the seven logos already on the current alsaqrsteels.com (ADNOC, Emaar, GASCO, SDIC, Takreer, Trane, Mada International), at your request. Please confirm each is a client you have worked for and may show; hide any that are not in Admin → Client logos.
- **Testimonials** — only with the source and the person's permission. None are shown now.
- **Project facts:** year, sector and emirate for each project where currently blank; confirm Burj Vista and DMCC Cluster Car Park are still ongoing.
- **"15+ years" / established 2010** — confirm the trade licence date.
- **DNV or other third-party claims** from earlier copy — supply evidence or keep them off.
- **Process steps** on the home page — confirm they match how quotes are actually handled.
- **CNC / laser cutting as a standalone service** (cut-to-drawing for other fabricators) — confirm.
- **Gates, railings and light structures** — whether to list them as a service category.
- **Company profile PDF** — the download button appears only once uploaded.
- **High-resolution logo** (SVG or large PNG) — the current file is the one from the old site.
- **Arabic translations** — the layout is RTL-ready; switch on with `NEXT_PUBLIC_ENABLE_ARABIC=true` once approved text exists.

## Credentials / settings still unset

- `ANTHROPIC_API_KEY` (AI assistant stays hidden without it)
- `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` (edge function secrets)
- `NEXT_PUBLIC_SITE_INDEXABLE=true` — only on the final production domain
- Vercel Web Analytics (optional, cookie-less)

## Housekeeping

- Delete the hidden empty file `.claude_tmp_sheet.jpg` from your Downloads folder (left over from an earlier session; it is 0 bytes).
- Legacy source files from the earlier build are excluded from compilation (`tsconfig.json`) and can be deleted.
- The `import-site-media` edge function can be removed after launch.
- Legacy gallery rows (14 unpublished projects with missing images) can be deleted from the CMS.
