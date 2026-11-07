# AI writer — plan and how to switch it on

The blog editor (Admin → Blog → New post) has an **✨ AI writer** card. You type
a topic and a focus keyword, press **Write a draft**, and the title, summary,
article, web address, tags and SEO fields are filled in. Nothing is saved or
published until a person reads it and presses **Save**.

It is built and ready, but **switched off** until an API key is added.

## 1. Switch it on (about 10 minutes)

1. Create an account at **console.anthropic.com** and add a payment method
   (Billing). Set a monthly spend limit there, e.g. USD 20.
2. In the console, go to **API keys → Create key**. Copy the key (it starts
   with `sk-ant-`). Keep it secret: never paste it in chat, email or code.
3. In **Hostinger → Websites → alsaqrsteels.com → Node.js → Environment
   variables**, add:
   - `ANTHROPIC_API_KEY` = the key you copied
4. Redeploy the site (Hostinger → Deployments → Redeploy).
5. Open Admin → Blog → New post: the AI writer card now shows the form.

To switch it off again, delete the variable and redeploy.

## 2. What it costs

Each draft is one request to Claude (model `claude-opus-5-5`): about 1,500
words in and out, plus the model's thinking. Expect roughly **USD 0.05–0.20
per draft**. 50 drafts a month is about USD 5–10. Anthropic bills monthly; the
spend limit from step 1 caps it.

Optional: for cheaper drafts, add `AI_WRITER_MODEL` = `claude-sonnet-5-5`
(about half the price, slightly less polished writing).

## 3. How it stays safe and accurate

- **Staff only.** Only signed-in staff can use it, and each person can make at
  most 10 drafts per hour (stops accidental or abusive spending).
- **The key never reaches the browser.** The request is made on the server
  (`src/lib/ai/writer.ts`).
- **Company facts are fixed** in the writer's instructions: the company name,
  workshop location, year founded and services. It is told **never to invent**
  prices, delivery times, projects, clients, certificates or approvals, and to
  describe regulations in general terms only.
- **Draft, not publish.** It always lands as text in the editor for review.
  The SEO checklist under the article then scores it like any other post.
- **Refusals and errors** are shown as plain messages. If a request is ever
  declined, the API automatically retries it on a suitable fallback model
  (`fallbacks: "default"`).

## 4. Checklist before publishing an AI draft

1. Read every paragraph. Delete anything that isn't true for Al Saqr.
2. Add your own experience: a real job, a photo from the workshop.
3. Add 2–4 photos inside the article with descriptions (alt text).
4. Check the SEO checklist score is 80+.
5. Set Status to Published and press Save.

## 5. Ideas for later (each is a small addition)

| Phase | Feature | What it does |
|---|---|---|
| 2 | **Improve this paragraph** | Select text in the editor → shorter / clearer / more technical. |
| 2 | **Fix my SEO** | One click on the SEO checklist rewrites the title or description to pass. |
| 3 | **Photo descriptions** | Writes alt text for photos you add, for Google Images. |
| 3 | **Arabic version** | Translates a published post for an Arabic page. |
| 4 | **Topic ideas** | Suggests next month's articles from what visitors search and click. |
| 4 | **Project write-ups** | Turns a few notes and photos of a finished job into a project page. |

## 6. Where the code lives

| File | Purpose |
|---|---|
| `src/lib/ai/writer.ts` | The writer: instructions, model, structured output, errors |
| `src/app/admin/actions.ts` → `aiDraftBlogPost` | Staff check and hourly limit |
| `src/components/admin/AiWriterPanel.tsx` | The card in the blog editor |
| `src/components/admin/SeoPanel.tsx` | Google preview and SEO checklist |
