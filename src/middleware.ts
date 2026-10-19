import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Runs only for the staff area: refreshes the Supabase session cookie and
// sends signed-out visitors to the login page. Public pages never pay for it.
// (Next.js 16 prefers the name proxy.ts; middleware.ts is still supported.)
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
