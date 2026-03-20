import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (anon key, RLS enforced).
 * Lazy-initialised to avoid build-time errors when env vars are absent.
 */
let _browser: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_browser) {
    _browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _browser;
}

/** Convenience alias kept for brevity in client components */
export { getSupabase as supabase };

/** Server-side Supabase client (service role, bypasses RLS) */
export function createServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
