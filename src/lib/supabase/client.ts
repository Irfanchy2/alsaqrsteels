import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, for use in Client Components (admin panel
// forms, the contact form's client-side bits).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
