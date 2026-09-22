import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './supabase';

/**
 * Server-Side Supabase Admin Client
 * 
 * IMPORTANT SECURITY RULES:
 * 1. The `service_role` key must ONLY be accessed server-side (Node.js/Express) via `process.env.SUPABASE_SERVICE_ROLE_KEY`.
 * 2. It bypasses Row Level Security (RLS) policies and has full administrative access to your database.
 * 3. NEVER prefix this key with `VITE_` and NEVER import or reference this file in client-side React components.
 */

let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Support both server-side environment variables and VITE URL fallback
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()?.replace(/['"]/g, '');

  if (!rawUrl || !serviceRoleKey) {
    return null;
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);

  try {
    supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return supabaseAdminInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase Admin client:', err);
    return null;
  }
}
