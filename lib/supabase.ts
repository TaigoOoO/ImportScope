import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client. Use inside "use client" components only.
 * For Server Components, Route Handlers or the Middleware, use
 * `lib/supabase-server.ts` instead.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
