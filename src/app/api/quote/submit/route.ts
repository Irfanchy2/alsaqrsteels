import { NextResponse } from "next/server";
import { fieldErrors, quoteFieldsSchema, submitSchema } from "@/lib/quote";
import { SITE_URL } from "@/lib/site";
import { MOCK, callEnquiryFunction, clientIpHash } from "@/lib/enquiry-backend";

export const preferredRegion = "hnd1";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const envelope = submitSchema.safeParse(json);
  if (!envelope.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  // Honeypot or an implausibly fast submission: answer like a validation
  // problem without storing anything.
  if (envelope.data.website || (envelope.data.elapsedMs !== undefined && envelope.data.elapsedMs < 2500)) {
    return NextResponse.json(
      { error: "validation", fields: { form: "Please take a moment to review the form, then submit again." } },
      { status: 422 }
    );
  }

  const fields = quoteFieldsSchema.safeParse(envelope.data.fields);
  if (!fields.success) {
    return NextResponse.json({ error: "validation", fields: fieldErrors(fields.error) }, { status: 422 });
  }

  if (MOCK) {
    return NextResponse.json({ reference: `TEST-${Date.now().toString().slice(-6)}`, notification: "not_configured", mock: true });
  }

  const result = await callEnquiryFunction({
    action: "submit",
    session: envelope.data.session,
    files: envelope.data.files,
    fields: fields.data,
    pagePath: envelope.data.pagePath,
    ipHash: await clientIpHash(),
    siteUrl: SITE_URL,
  });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
