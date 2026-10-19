# Deploying to Hostinger from GitHub

This site is a **Next.js 16 app with a Node.js server** (quote form, staff CMS, API routes),
so it has to run on Hostinger's **Node.js Web App** hosting. Plain shared hosting that only
serves HTML/PHP will not run it. You need a Hostinger plan that includes Node.js web apps
(Business Web Hosting, Cloud, or a VPS).

Once it is connected, every `git push` to the `main` branch rebuilds and redeploys the site
automatically.

---

## 1. Create the empty GitHub repository

1. Go to <https://github.com/new>.
2. Repository name: `alsaqr-steels`. Set it to **Private**.
3. Do **not** tick "Add a README", ".gitignore" or "license". The repo must be empty.
4. Click **Create repository** and copy its URL, for example
   `https://github.com/YOUR-USERNAME/alsaqr-steels.git`.

## 2. Push this code (run in Terminal, in this folder)

```bash
git remote add origin https://github.com/YOUR-USERNAME/alsaqr-steels.git
git push -u origin main
```

GitHub asks you to sign in in the browser the first time. If it asks for a password in
Terminal, use a Personal Access Token (GitHub → Settings → Developer settings → Tokens),
not your account password.

## 3. Connect the repo in Hostinger

1. hPanel → **Websites** → **Add website** → **Node.js Web App**
   (on some plans: Website → **Node.js** in the sidebar).
2. Choose **Import Git repository** → **Connect GitHub** → authorise Hostinger → pick
   `alsaqr-steels`, branch `main`.
3. Build settings (Hostinger usually detects Next.js automatically; check they match):

   | Setting | Value |
   |---|---|
   | Framework | Next.js |
   | Node version | 20 or 22 |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Start command | `npm start` |
   | Output / root directory | leave default (`/`) |

4. **Environment variables**: add these before the first deploy:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ajurellftenxollyfahb.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key from `.env.local.example` |
   | `NEXT_PUBLIC_MEDIA_BASE` | `https://ajurellftenxollyfahb.supabase.co/storage/v1/object/public/media` |
   | `ENQUIRY_FUNCTION_SECRET` | the secret stored in Supabase `app_config` (keep private) |
   | `NEXT_PUBLIC_SITE_URL` | `https://alsaqrsteels.com` |
   | `NEXT_PUBLIC_SITE_INDEXABLE` | `false` while testing, `true` once it is live on the real domain |
   | `ANTHROPIC_API_KEY` | optional; turns on the Project Assistant |

5. Click **Deploy**. Hostinger gives you a temporary URL; check the site there first.

## 4. Point the domain

When the temporary URL looks right, attach `alsaqrsteels.com` to the Node.js app in hPanel
(Domains → connect to this website). Because the domain is already on Hostinger, this is
usually one click. **Leave the email (MX) records alone** so company email keeps working.
Then set `NEXT_PUBLIC_SITE_INDEXABLE=true` and redeploy.

## Updating the site later

- **Text, projects, photos**: use the staff CMS at `/admin`. No deploy needed.
- **Code or design changes**: commit and `git push`. Hostinger rebuilds automatically.
  If a deploy fails, hPanel → the app → **Deployments** shows the build log, and you can
  redeploy the previous version from there.

## Notes

- `vercel.json` and the `preferredRegion` lines are ignored on Hostinger and do no harm.
- Stock photos live in `public/images/stock/` (see `CREDITS.md` there). Anything uploaded
  through the CMS replaces them automatically.
