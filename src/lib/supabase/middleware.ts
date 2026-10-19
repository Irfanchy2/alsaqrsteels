import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session for /admin routes and redirects
// signed-out visitors to /admin/login. Whether a signed-in user is actually
// staff is checked again in the admin layout (and enforced by RLS).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Fast path: reads the session from the cookie and only calls Supabase when
  // the token has expired and needs refreshing. The real security check
  // (verified identity + staff list) happens in requireStaff() on the server.
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user?.id ?? null;

  const path = request.nextUrl.pathname;
  if (!user && path !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
