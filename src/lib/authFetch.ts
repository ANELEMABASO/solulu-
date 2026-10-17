import { getSupabase } from './supabase';

// Sends the signed-in Supabase session token so the server can verify the lecturer.
export async function authHeaders(): Promise<Record<string, string>> {
  const client = getSupabase();
  if (!client) return {};
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
