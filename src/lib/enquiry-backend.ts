import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Server-side bridge to the submit-enquiry edge function. The shared secret
// never reaches the browser.

export type BackendResult = { status: number; body: Record<string, unknown> };

const UNAVAILABLE: BackendResult = {
  status: 503,
  body: {
    error: "unavailable",
    message:
      "Our online form can't accept requests right now. Nothing was sent. Please call or WhatsApp us, or try again in a few minutes.",
  },
};

// Local testing only: never active on Vercel.
export const MOCK = process.env.ENQUIRY_MOCK === "1" && process.env.VERCEL !== "1";

export async function clientIpHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.ENQUIRY_FUNCTION_SECRET ?? "local";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function callEnquiryFunction(payload: Record<string, unknown>): Promise<BackendResult> {
  const secret = process.env.ENQUIRY_FUNCTION_SECRET;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret || !base || !key) return UNAVAILABLE;

  try {
    const res = await fetch(`${base}/functions/v1/submit-enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, "x-enquiry-secret": secret },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    let body: Record<string, unknown> = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    if (res.status >= 500 || res.status === 401) {
      console.error("submit-enquiry failed", res.status, body);
      return UNAVAILABLE;
    }
    return { status: res.status, body };
  } catch (err) {
    console.error("submit-enquiry unreachable", err);
    return UNAVAILABLE;
  }
}
