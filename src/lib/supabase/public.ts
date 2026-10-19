import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cookie-less client for public, cacheable reads (static/ISR pages and route
// handlers). Uses the publishable key, so Row Level Security decides what is
// visible: published content only.
export const CONTENT_TAG = "content";

let client: SupabaseClient | null = null;

export function publicClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          // Every public read is tagged "content", so a save in the admin panel
          // can expire exactly these cached reads (see refreshSite in
          // src/lib/admin.ts). The 60-second revalidate is a safety net.
          fetch: (input, init) => {
            const method = (init?.method ?? "GET").toUpperCase();
            if (method !== "GET" && method !== "HEAD") return fetch(input, init);
            return fetch(input, { ...init, next: { revalidate: 60, tags: [CONTENT_TAG] } } as RequestInit);
          },
        },
      }
    );
  }
  return client;
}
