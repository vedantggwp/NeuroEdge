import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function createDbClient(): SupabaseClient {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url) throw new Error('SUPABASE_URL environment variable is required');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');

  return createClient(url, key);
}

export const db = createDbClient();
