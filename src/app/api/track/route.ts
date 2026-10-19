import { NextResponse } from "next/server";
import { z } from "zod";
import { publicClient } from "@/lib/supabase/public";

export const preferredRegion = "hnd1";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.enum(["contact_click", "quote_start", "assistant_open", "assistant_handoff", "page_view"]),
  path: z.string().max(200).optional(),
  props: z
    .object({
      channel: z.enum(["phone", "whatsapp", "email", "maps"]).optional(),
      service: z.string().max(60).optional(),
      source: z.string().max(30).optional(),
      ref: z.string().max(80).optional(),
      device: z.enum(["mobile", "tablet", "desktop"]).optional(),
      new: z.boolean().optional(),
    })
    .strip()
    .default({}),
});

// First-party, cookie-free event log. No IP, user agent or form content is
// stored — only the event name, the page path and whitelisted properties.
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(null, { status: 204 });
    if (process.env.CONTENT_SOURCE === "seed") return new NextResponse(null, { status: 204 });
    const props: Record<string, unknown> = { ...parsed.data.props };
    if (!props.new) delete props.new;
    if (parsed.data.name === "page_view") {
      // Country comes from the hosting edge, never from the visitor's IP stored by us.
      const country = req.headers.get("x-vercel-ip-country");
      if (country && /^[A-Z]{2}$/.test(country)) props.country = country;
      if (/bot|crawl|spider|preview|headless/i.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
    }
    await publicClient().rpc("track_event", {
      p_name: parsed.data.name,
      p_path: (parsed.data.path ?? "").split("?")[0],
      p_props: props,
    });
  } catch {
    // Never surface tracking failures.
  }
  return new NextResponse(null, { status: 204 });
}
