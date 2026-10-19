import { NextResponse } from "next/server";
import { z } from "zod";
import { getCompany, getServices, getProjects, getFaqs, getProcessSteps } from "@/lib/content";
import { publicClient } from "@/lib/supabase/public";
import { ASSISTANT_LIMITS, type EnquirySummary } from "@/lib/assistant";
import { buildSystemPrompt, enquiryTool } from "@/lib/assistant-prompt";
import { clientIpHash } from "@/lib/enquiry-backend";

export const preferredRegion = "hnd1";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = process.env.ASSISTANT_MODEL || "claude-haiku-4-5";
const available = () => Boolean(process.env.ANTHROPIC_API_KEY);

const bodySchema = z.object({
  consent: z.literal(true),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(ASSISTANT_LIMITS.maxMessages),
});

// In-process fallback limiter (used alongside the database limiter).
const memory = new Map<string, { at: number; n: number }>();
function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cur = memory.get(key);
  if (!cur || now - cur.at > windowMs) {
    memory.set(key, { at: now, n: 1 });
    return true;
  }
  cur.n += 1;
  return cur.n <= limit;
}

async function allowed(ipHash: string) {
  if (!memoryLimit(ipHash, 20, 10 * 60_000)) return false;
  if (process.env.CONTENT_SOURCE === "seed") return true;
  try {
    const db = publicClient();
    const checks = await Promise.all([
      db.rpc("hit_rate_limit", { p_key: `ai:${ipHash}`, p_limit: 20, p_window_seconds: 600 }),
      db.rpc("hit_rate_limit", { p_key: `ai-day:${ipHash}`, p_limit: 120, p_window_seconds: 86400 }),
      db.rpc("hit_rate_limit", { p_key: "ai:all", p_limit: Number(process.env.ASSISTANT_DAILY_CAP ?? 1500), p_window_seconds: 86400 }),
    ]);
    return checks.every((c) => c.error || c.data === true);
  } catch {
    return true;
  }
}

export async function GET() {
  return NextResponse.json({ available: available() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!available()) {
    return NextResponse.json(
      { error: "unavailable", message: "The Project Assistant is offline right now. You can still use the quote form, WhatsApp or phone." },
      { status: 503 }
    );
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const messages = parsed.data.messages;
  const last = messages[messages.length - 1];
  if (last.role !== "user" || last.content.length > ASSISTANT_LIMITS.maxUserChars) {
    return NextResponse.json({ error: "invalid_request", message: "Messages are limited to 1,000 characters." }, { status: 400 });
  }

  const ipHash = await clientIpHash();
  if (!(await allowed(ipHash))) {
    return NextResponse.json(
      { error: "rate_limited", message: "You've reached the chat limit for now. Please use the quote form or call us." },
      { status: 429 }
    );
  }

  const [company, services, projects, faqs, steps] = await Promise.all([
    getCompany(),
    getServices(),
    getProjects(),
    getFaqs(),
    getProcessSteps(),
  ]);

  const system = buildSystemPrompt({ company, services, projects, faqs, steps });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: ASSISTANT_LIMITS.maxOutputTokens,
        temperature: 0.3,
        system,
        tools: [enquiryTool(services.map((s) => s.slug))],
        messages: messages.map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
      }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("assistant provider error", res.status, (await res.text()).slice(0, 300));
      return NextResponse.json(
        { error: "provider", message: "The assistant couldn't answer just now. Please try again, or use the quote form." },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      content: ({ type: "text"; text: string } | { type: "tool_use"; name: string; input: Record<string, unknown> })[];
    };
    let reply = data.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const tool = data.content.find(
      (b): b is { type: "tool_use"; name: string; input: Record<string, unknown> } =>
        b.type === "tool_use" && b.name === "prepare_enquiry_summary"
    );
    let summary: EnquirySummary | null = null;
    if (tool) {
      const i = tool.input;
      const s = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
      summary = {
        service: s(i.service, 60),
        location: s(i.location, 200),
        scope: s(i.scope, 5000),
        dimensions: s(i.dimensions, 1000),
        quantities: s(i.quantities, 1000),
        targetDate: /^\d{4}-\d{2}-\d{2}$/.test(s(i.targetDate, 10)) ? s(i.targetDate, 10) : "",
        openQuestions: Array.isArray(i.openQuestions) ? i.openQuestions.slice(0, 6).map((q) => s(q, 200)) : [],
      };
      if (!reply) reply = "Here's a summary of your requirement. Please check and edit it, then continue to the quote form to add your contact details and drawings.";
    }
    if (!reply) reply = "Sorry, I don't have an answer for that. Our team can help — use the quote form, WhatsApp or call us.";
    return NextResponse.json({ reply, summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("assistant error", err);
    return NextResponse.json(
      { error: "provider", message: "The assistant timed out. Please try again, or use the quote form." },
      { status: 504 }
    );
  }
}
