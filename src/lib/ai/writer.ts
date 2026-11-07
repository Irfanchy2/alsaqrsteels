import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";

// AI writer for blog drafts (Admin > Blog > New post > AI writer).
// Switched on by setting ANTHROPIC_API_KEY on the server (Hostinger:
// Websites > your site > Node.js > Environment variables). Without it the
// editor shows how to turn it on and nothing is sent anywhere.
// See docs/AI-WRITER-PLAN.md for the plan, costs and how to change the model.
export const AI_MODEL = process.env.AI_WRITER_MODEL || "claude-opus-5-5";

export function aiWriterEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

export const DraftSchema = z.object({
  title: z.string().describe("Article headline, under 70 characters"),
  slug: z.string().describe("URL slug: lowercase words joined by hyphens"),
  excerpt: z.string().describe("One or two sentences for the blog list"),
  meta_title: z.string().describe("SEO title, 30-60 characters, contains the focus keyword"),
  meta_description: z.string().describe("SEO description, 120-160 characters, contains the focus keyword"),
  tags: z.string().describe("3-6 comma-separated topic tags"),
  content_html: z.string().describe("The article body as HTML"),
});
export type Draft = z.infer<typeof DraftSchema>;

// Facts the model may rely on. Anything else must stay general.
const SYSTEM = `You write blog articles for the website of Al Saqr Al Ahmar Welding and Blacksmith LLC (alsaqrsteels.com), a steel fabrication workshop established in 2010 in Musaffah Industrial 44, Abu Dhabi, UAE. Services: structural steel fabrication and installation, steel sheds and warehouses, car parking shades, staircases, handrails and ladders, gates and fences, pergolas, pipeline welding, CNC laser and plasma cutting, storage tanks and stainless steel work, for contractors, consultants, industrial clients and villa owners across the UAE.

Write a practical, accurate article that helps someone in the UAE plan or buy this kind of work, and that ranks on Google for the focus keyword.

Rules:
- Never invent facts about the company: no prices, delivery times, project names, client names, certificates, approvals, staff numbers or awards. Describe what drives cost and time instead of quoting numbers.
- Regulations: refer to the authority in general terms (e.g. "the municipality", "Civil Defence", "your consultant") and do not quote clause numbers or specific limits you are unsure of.
- Audience reads plainly: short paragraphs, clear subheadings, British English, no hype.
- Use the focus keyword naturally in the first paragraph, in at least one <h2>, the meta title and the meta description.
- Length: 900-1300 words.
- HTML: use only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th scope="col">, <td> and <a href>. No <h1>, no images, no inline styles.
- Include an "Frequently asked questions" <h2> with 3 short <h3> questions and answers.
- Link to 2-4 of these pages where relevant: /services, /services/steel-structures, /projects, /about, /quality, /contact, and end with a sentence linking to /quote.`;

export async function writeDraft(input: { topic: string; keyword: string; notes?: string }): Promise<{ ok: true; draft: Draft } | { ok: false; error: string }> {
  if (!aiWriterEnabled()) return { ok: false, error: "The AI writer is not switched on yet." };
  const client = new Anthropic();
  const prompt = [
    `Topic: ${input.topic}`,
    `Focus keyword: ${input.keyword || "(choose the best one for the topic)"}`,
    input.notes ? `Notes from the company (follow them):\n${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await client.beta.messages.parse({
      model: AI_MODEL,
      max_tokens: 16000,
      // If the request is ever declined, the API retries it on a suitable
      // fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(DraftSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") return { ok: false, error: "The AI declined this topic. Try wording it differently." };
    if (response.stop_reason === "max_tokens") return { ok: false, error: "The draft was too long and got cut off. Try a narrower topic." };
    if (!response.parsed_output) return { ok: false, error: "The AI reply could not be read. Please try again." };
    return { ok: true, draft: response.parsed_output };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, error: "The AI key is not valid. Check ANTHROPIC_API_KEY on the server." };
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: "Too many AI requests right now. Wait a minute and try again." };
    if (e instanceof Anthropic.APIError) return { ok: false, error: `The AI service returned an error (${e.status}). Try again later.` };
    return { ok: false, error: "Could not reach the AI service. Try again later." };
  }
}
