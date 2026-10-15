import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type DraftStatus = 'pending' | 'sent' | 'simulated' | 'rejected' | 'failed';

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

const STORE_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'drafts.json');

// Persisted to disk because the Vite dev server restarts whenever server files change.
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

export function listDrafts() {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDraft(id: string) {
  return load().find((d) => d.id === id);
}

export function createDraft(input: Pick<EmailDraft, 'studentNumber' | 'studentName' | 'moduleCode' | 'to' | 'subject' | 'body'>) {
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

export function updateDraft(id: string, patch: Partial<EmailDraft>) {
  const drafts = load();
  const index = drafts.findIndex((d) => d.id === id);
  if (index < 0) return undefined;
  drafts[index] = { ...drafts[index], ...patch };
  save(drafts);
  return drafts[index];
}
