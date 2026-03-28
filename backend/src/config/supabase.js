import { createClient } from "@supabase/supabase-js";

const baseClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
};

/**
 * @param {{ supabaseUrl: string, supabaseAnonKey: string }} config
 */
export function createSupabasePublicAuthClient(config) {
  return createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    baseClientOptions
  );
}

/**
 * @param {{ supabaseUrl: string, supabaseServiceKey: string }} config
 */
export function createSupabaseAdminClient(config) {
  return createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    baseClientOptions
  );
}
