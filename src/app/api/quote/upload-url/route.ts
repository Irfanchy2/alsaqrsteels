import { NextResponse } from "next/server";
import { uploadUrlSchema } from "@/lib/quote";
import { UPLOAD_LIMITS } from "@/lib/site";
import { MOCK, callEnquiryFunction, clientIpHash } from "@/lib/enquiry-backend";

export const preferredRegion = "hnd1";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = uploadUrlSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { session, fileName, size, type } = parsed.data;

  if (!(UPLOAD_LIMITS.types as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "file_type", message: "Only PDF, JPG and PNG files can be attached." }, { status: 422 });
  }
  if (size > UPLOAD_LIMITS.maxFileBytes) {
    return NextResponse.json({ error: "file_size", message: "Each file must be 10 MB or smaller." }, { status: 422 });
  }

  if (MOCK) {
    const path = `incoming/${session}/${crypto.randomUUID()}-${fileName.replace(/[^A-Za-z0-9._-]+/g, "-")}`;
    return NextResponse.json({ path, signedUrl: `/api/quote/mock-upload?path=${encodeURIComponent(path)}`, mock: true });
  }

  const result = await callEnquiryFunction({
    action: "upload-url",
    session,
    fileName,
    size,
    type,
    ipHash: await clientIpHash(),
  });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
