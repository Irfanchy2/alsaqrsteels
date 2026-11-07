# AI writer — plan and how to switch it on

The blog editor (Admin → Blog → New post) has an **✨ AI writer** card. You type
a topic and a focus keyword, press **Write a draft**, and the title, summary,
article, web address, tags and SEO fields are filled in. Nothing is saved or
published until a person reads it and presses **Save**.

It is built and ready, but **switched off** until you add the settings below.
It works with **free** AI services. No paid chatbot is needed.

## 1. Switch it on for free (about 10 minutes)

The writer talks to any service that speaks the common "OpenAI-compatible"
format. Three free options:

| Service | Free models | `AI_BASE_URL` |
|---|---|---|
| **OpenRouter** (recommended) | Hermes, Llama, Qwen, DeepSeek, Gemma… (models marked **free**) | `https://openrouter.ai/api/v1` |
| **Groq** | Llama and other open models, very fast | `https://api.groq.com/openai/v1` |
| **Google AI Studio** | Gemini (free tier) | `https://generativelanguage.googleapis.com/v1beta/openai` |

### Example: OpenRouter with a free Hermes model

1. Sign up at **openrouter.ai** (free, no card needed for free models).
2. Go to **Keys → Create key**. Copy it (starts with `sk-or-`). Keep it
   secret: never paste it in chat, email or code.
3. Go to **Models**, tick **Free** in the price filter and search
   **hermes** (or any model you like). Open the model and copy its name,
   e.g. `nousresearch/…:free` (free models end with `:free`).
4. In **Hostinger → Websites → alsaqrsteels.com → Node.js → Environment
   variables**, add three variables:
   - `AI_BASE_URL` = `https://openrouter.ai/api/v1`
   - `AI_API_KEY` = the key from step 2
   - `AI_WRITER_MODEL` = the model name from step 3
5. Redeploy the site (Hostinger → Deployments → Redeploy).
6. Open Admin → Blog → New post: the AI writer card now shows the form.

For Groq or Google AI Studio it is the same: create a free key there, copy a
model name from their model list, and use their `AI_BASE_URL` from the table.

To switch it off, delete the variables and redeploy. To try another free
model, change `AI_WRITER_MODEL` and redeploy.

## 2. What it costs

**Nothing** with a free model. Things to know about free plans:

- **Daily limits.** Free models allow a limited number of requests per day
  (often a few dozen). If you hit it, the editor says so; try again later.
- **Speed.** A draft can take 30 seconds to 2 minutes.
- **Quality varies by model.** If drafts are poor, or the editor says the
  reply was "not in the expected format", try another free model. Larger
  models (e.g. 70B and up) write better articles.
- **Privacy.** Free services may keep and learn from what you send. Only
  send what will be published anyway (topic, keyword, public notes), never
  client details or prices.

**Optional, paid, best quality:** instead of the three variables above, set
`ANTHROPIC_API_KEY` to use Anthropic's Claude (about USD 0.05–0.20 per draft).
If both are set, the free service is used.

## 3. How it stays safe and accurate

- **Staff only.** Only signed-in staff can use it, and each person can make at
  most 10 drafts per hour (stops accidental or abusive spending).
- **The key never reaches the browser.** The request is made on the server
  (`src/lib/ai/writer.ts`).
- **Checks the reply.** Free models often wrap their answer in extra text;
  the writer finds the draft in the reply and checks every field is there
  before filling the editor.
- **Company facts are fixed** in the writer's instructions: the company name,
  workshop location, year founded and services. It is told **never to invent**
  prices, delivery times, projects, clients, certificates or approvals, and to
  describe regulations in general terms only.
- **Draft, not publish.** It always lands as text in the editor for review.
  The SEO checklist under the article then scores it like any other post.
- **Errors** (wrong key, unknown model, daily limit reached) are shown as
  plain messages in the editor. With Claude, a declined request is retried
  automatically on a fallback model.

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
| `src/lib/ai/writer.ts` | The writer: instructions, free (OpenAI-compatible) and Claude connections, reply checks, errors |
| `src/app/admin/actions.ts` → `aiDraftBlogPost` | Staff check and hourly limit |
| `src/components/admin/AiWriterPanel.tsx` | The card in the blog editor |
| `src/components/admin/SeoPanel.tsx` | Google preview and SEO checklist |
