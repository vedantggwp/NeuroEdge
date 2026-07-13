import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (anon key, RLS enforced).
 * Lazy-initialised to avoid build-time errors when env vars are absent.
 */
let _browser: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_browser) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
    if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");

    _browser = createClient(url, key);
  }
  return _browser;
}

/** Convenience alias kept for brevity in client components */
export { getSupabase as supabase };

/** Server-side Supabase client (service role, bypasses RLS) */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient(url, key);
}
