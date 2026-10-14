import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let serverClientInstance: SupabaseClient<Database> | null = null;

/**
 * Creates or retrieves the singleton server-side Supabase client.
 * Strictly intended for server-side environments (API routes, server actions).
 * Uses SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getServerSupabaseClient(): SupabaseClient<Database> {
  if (serverClientInstance) {
    return serverClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL is not set."
    );
  }

  if (!serviceKey) {
    throw new Error(
      "Missing Supabase configuration: SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is not set."
    );
  }

  serverClientInstance = createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClientInstance;
}
