import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getAdminClient } from '../auth.ts';

export type DraftStatus = 'pending' | 'sending' | 'sent' | 'simulated' | 'rejected' | 'failed';

export interface EmailDraft {
  id: string;
  studentNumber: string;
  studentName: string;
  moduleCode: string;
  to: string;
  subject: string;
  body: string;
  status: DraftStatus;
  createdAt: string;
  decidedAt?: string;
  note?: string;
}

type NewDraft = Pick<EmailDraft, 'studentNumber' | 'studentName' | 'moduleCode' | 'to' | 'subject' | 'body'>;

const STORE_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'drafts.json');

// Local file store, used only when Supabase is not configured (the Vite dev server restarts on server file changes).
function load(): EmailDraft[] {
  try {
    return existsSync(STORE_FILE) ? JSON.parse(readFileSync(STORE_FILE, 'utf8')) : [];
  } catch {
    return [];
  }
}

function save(drafts: EmailDraft[]) {
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(drafts, null, 2));
}

function fromRow(r: any): EmailDraft {
  return {
    id: r.id,
    studentNumber: r.student_number,
    studentName: r.student_name,
    moduleCode: r.module_code,
    to: r.to_address,
    subject: r.subject,
    body: r.body,
    status: r.status,
    createdAt: r.created_at,
    decidedAt: r.decided_at ?? undefined,
    note: r.note ?? undefined,
  };
}

function toPatchRow(patch: Partial<EmailDraft>) {
  const row: Record<string, unknown> = {};
  if (patch.subject !== undefined) row.subject = patch.subject;
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.decidedAt !== undefined) row.decided_at = patch.decidedAt;
  if (patch.note !== undefined) row.note = patch.note;
  return row;
}

export async function listDrafts(): Promise<EmailDraft[]> {
  const db = getAdminClient();
  if (!db) return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { data, error } = await db.from('email_drafts').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) throw new Error(`Could not load drafts: ${error.message}`);
  return (data ?? []).map(fromRow);
}

export async function getDraft(id: string): Promise<EmailDraft | undefined> {
  const db = getAdminClient();
  if (!db) return load().find((d) => d.id === id);
  const { data, error } = await db.from('email_drafts').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Could not load draft: ${error.message}`);
  return data ? fromRow(data) : undefined;
}

export async function createDraft(input: NewDraft): Promise<{ draft: EmailDraft; duplicate: boolean }> {
  const db = getAdminClient();
  if (!db) {
    const drafts = load();
    const duplicate = drafts.find(
      (d) => d.status === 'pending' && d.studentNumber === input.studentNumber && d.moduleCode === input.moduleCode,
    );
    if (duplicate) return { draft: duplicate, duplicate: true };
    const draft: EmailDraft = { ...input, id: randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
    drafts.push(draft);
    save(drafts);
    return { draft, duplicate: false };
  }

  const existing = await db
    .from('email_drafts')
    .select('*')
    .eq('status', 'pending')
    .eq('student_number', input.studentNumber)
    .eq('module_code', input.moduleCode)
    .limit(1);
  if (existing.error) throw new Error(`Could not check drafts: ${existing.error.message}`);
  if (existing.data?.length) return { draft: fromRow(existing.data[0]), duplicate: true };

  const inserted = await db
    .from('email_drafts')
    .insert({
      student_number: input.studentNumber,
      student_name: input.studentName,
      module_code: input.moduleCode,
      to_address: input.to,
      subject: input.subject,
      body: input.body,
    })
    .select('*')
    .single();
  if (inserted.error) throw new Error(`Could not save draft: ${inserted.error.message}`);
  return { draft: fromRow(inserted.data), duplicate: false };
}

export async function updateDraft(id: string, patch: Partial<EmailDraft>): Promise<EmailDraft | undefined> {
  const db = getAdminClient();
  if (!db) {
    const drafts = load();
    const index = drafts.findIndex((d) => d.id === id);
    if (index < 0) return undefined;
    drafts[index] = { ...drafts[index], ...patch };
    save(drafts);
    return drafts[index];
  }
  const { data, error } = await db.from('email_drafts').update(toPatchRow(patch)).eq('id', id).select('*').maybeSingle();
  if (error) throw new Error(`Could not update draft: ${error.message}`);
  return data ? fromRow(data) : undefined;
}

// Atomically moves a pending draft to 'sending' so a double click or concurrent request cannot send it twice.
export async function claimDraft(id: string): Promise<EmailDraft | undefined> {
  const db = getAdminClient();
  if (!db) {
    const draft = load().find((d) => d.id === id);
    return draft?.status === 'pending' ? draft : undefined;
  }
  const { data, error } = await db
    .from('email_drafts')
    .update({ status: 'sending' })
    .eq('id', id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`Could not claim draft: ${error.message}`);
  return data ? fromRow(data) : undefined;
}
