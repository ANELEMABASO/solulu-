import type { IncomingMessage } from 'node:http';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null | undefined;

function supabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
}

// Service-role client: server-side only, bypasses RLS. Never expose or prefix with VITE_.
export function getAdminClient(): SupabaseClient | null {
  if (admin !== undefined) return admin;
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, '');
  admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return admin;
}

export function isLoopbackRequest(req: IncomingMessage) {
  const address = req.socket.remoteAddress;
  const loopback = address === '::1' || address === '127.0.0.1' || address === '::ffff:127.0.0.1';
  const host = req.headers.host || '';
  const origin = req.headers.origin;
  return loopback && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) && (!origin || new URL(origin).host === host);
}

function lecturerEmails() {
  return new Set(
    (process.env.LECTURER_EMAILS || process.env.LECTURER_EMAIL || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export interface Lecturer {
  email: string;
}

// Explains a failed hosted sign-in check without revealing any secret values.
export async function explainAuthFailure(req: IncomingMessage): Promise<string> {
  const header = req.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const client = getAdminClient();
  if (!client) return 'Server is not configured: set SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL) in the Vercel environment variables, then redeploy.';
  if (lecturerEmails().size === 0) return 'Server is not configured: set LECTURER_EMAILS in the Vercel environment variables, then redeploy.';
  if (!token) return 'Sign out and sign in again as a lecturer to manage drafts.';
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return 'Your session has expired or is invalid. Sign out and sign in again.';
  return `${data.user.email} is not in LECTURER_EMAILS on the server.`;
}

// A lecturer is a Supabase Auth user whose verified email is in LECTURER_EMAILS.
// `hosted` requests must carry a valid token; local dev (loopback) is trusted as before.
export async function authenticateLecturer(req: IncomingMessage, hosted: boolean): Promise<Lecturer | null> {
  const header = req.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (token) {
    const client = getAdminClient();
    if (client) {
      const { data, error } = await client.auth.getUser(token);
      const email = data.user?.email?.toLowerCase();
      if (!error && email && lecturerEmails().has(email)) return { email };
    }
  }

  if (!hosted && isLoopbackRequest(req)) return { email: 'local' };
  return null;
}
