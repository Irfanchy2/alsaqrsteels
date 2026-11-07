import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";

// AI writer for blog drafts (Admin > Blog > New post > AI writer).
// Off until the server has AI settings (Hostinger: Websites > your site >
// Node.js > Environment variables). Two ways to switch it on:
//
//  1. Free: any OpenAI-compatible service with a free tier (OpenRouter's free
//     models such as Hermes, Groq, Google AI Studio). Set
//       AI_BASE_URL      e.g. https://openrouter.ai/api/v1
//       AI_API_KEY       the key from that service
//       AI_WRITER_MODEL  the model name from that service
//  2. Paid (best quality): Anthropic's Claude. Set ANTHROPIC_API_KEY
//     (AI_WRITER_MODEL optional, default claude-opus-5-5).
//
// If both are set, the free service is used. See docs/AI-WRITER-PLAN.md.
const FREE = {
  baseUrl: (process.env.AI_BASE_URL ?? "").replace(/\/+$/, ""),
  apiKey: process.env.AI_API_KEY ?? "",
  model: process.env.AI_WRITER_MODEL ?? "",
};
const freeConfigured = () => !!(FREE.baseUrl && FREE.apiKey && FREE.model);
export const AI_MODEL = process.env.AI_WRITER_MODEL || "claude-opus-5-5";

export function aiWriterEnabled() {
  return freeConfigured() || !!process.env.ANTHROPIC_API_KEY;
}

export function aiWriterName() {
  if (freeConfigured()) return FREE.model;
  return process.env.ANTHROPIC_API_KEY ? AI_MODEL : null;
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

type Result = { ok: true; draft: Draft } | { ok: false; error: string };
type Input = { topic: string; keyword: string; notes?: string };

const promptFor = (input: Input) =>
  [
    `Topic: ${input.topic}`,
    `Focus keyword: ${input.keyword || "(choose the best one for the topic)"}`,
    input.notes ? `Notes from the company (follow them):\n${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

export async function writeDraft(input: Input): Promise<Result> {
  if (freeConfigured()) return writeWithCompatible(input);
  if (process.env.ANTHROPIC_API_KEY) return writeWithClaude(input);
  return { ok: false, error: "The AI writer is not switched on yet." };
}

// Free / OpenAI-compatible services (OpenRouter, Groq, Google AI Studio…).
// Free models follow formats less strictly, so the reply is searched for the
// JSON object and checked against the schema before it is used.
async function writeWithCompatible(input: Input): Promise<Result> {
  const keys = Object.keys(DraftSchema.shape).join(", ");
  const body = {
    model: FREE.model,
    max_tokens: 8000,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `${promptFor(input)}\n\nReply with ONLY one JSON object, no other text, with exactly these string keys: ${keys}. "content_html" holds the whole article as HTML.`,
      },
    ],
  };
  const call = async (withFormat: boolean) =>
    fetch(`${FREE.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FREE.apiKey}`,
        "Content-Type": "application/json",
        // Shown on OpenRouter's dashboard; ignored by other services.
        "HTTP-Referer": "https://alsaqrsteels.com",
        "X-Title": "Al Saqr admin AI writer",
      },
      body: JSON.stringify(withFormat ? body : { ...body, response_format: undefined }),
      signal: AbortSignal.timeout(150_000),
      cache: "no-store",
    });
  try {
    let res = await call(true);
    // Some free models reject response_format: retry once without it.
    if (res.status === 400) res = await call(false);
    if (res.status === 401 || res.status === 403) return { ok: false, error: "The AI key was not accepted. Check AI_API_KEY on the server." };
    if (res.status === 404) return { ok: false, error: "That AI model was not found. Check AI_WRITER_MODEL on the server." };
    if (res.status === 429) return { ok: false, error: "The free AI limit is used up for now. Try again later (free plans have daily limits)." };
    if (!res.ok) return { ok: false, error: `The AI service returned an error (${res.status}). Try again later.` };
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      return { ok: false, error: "The AI reply was not in the expected format. Press Write a draft again, or try another model." };
    }
    const parsed = DraftSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "The AI left out part of the draft. Press Write a draft again, or try another model." };
    return { ok: true, draft: parsed.data };
  } catch {
    return { ok: false, error: "Could not reach the AI service (or it took too long). Try again later." };
  }
}

async function writeWithClaude(input: Input): Promise<Result> {
  const client = new Anthropic();
  const prompt = promptFor(input);

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
