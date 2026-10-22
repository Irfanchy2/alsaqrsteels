import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isProductionHost } from "@/lib/site";

// 1. Staff area: refreshes the Supabase session and sends signed-out visitors
//    to the login page.
// 2. Every other page: on any address other than the real domain (Hostinger
//    test domain, previews, localhost) tell search engines not to index it.
// (Next.js 16 prefers the name proxy.ts; middleware.ts is still supported.)
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return await updateSession(request);
  const res = NextResponse.next();
  if (!isProductionHost(request.headers.get("host"))) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  // Skip static files and images; they never need either step.
  matcher: ["/((?!_next/static|_next/image|images/|video/|brand/|cursors/|favicon.ico|icon.png|apple-icon.png).*)"],
};
