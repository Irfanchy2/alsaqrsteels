import { NextResponse } from "next/server";
import { MOCK } from "@/lib/enquiry-backend";

export const preferredRegion = "hnd1";

// Test double for local, offline end-to-end tests only (ENQUIRY_MOCK=1, never
// on Vercel). Accepts the upload and discards it.
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (!MOCK) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await req.arrayBuffer();
  return NextResponse.json({ Key: "mock" });
}
