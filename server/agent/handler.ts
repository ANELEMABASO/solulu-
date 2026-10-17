import type { IncomingMessage, ServerResponse } from 'node:http';
import { CURRENT_STUDENT } from '../../src/data/unisaData.ts';
import { runAgent } from './agent.ts';
import { authenticateLecturer } from '../auth.ts';
import { createRepository } from './repository.ts';

const MAX_BODY_BYTES = 10_000;
const MAX_MESSAGE_CHARS = 1_000;
const repo = createRepository();

type AgentRequest = IncomingMessage & { body?: unknown };
type AgentOptions = { hosted?: boolean };

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req: AgentRequest): Promise<unknown> {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error('too_large');
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export async function handleAgentRequest(req: AgentRequest, res: ServerResponse, options: AgentOptions = {}) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' });

  try {
    const body = await readJson(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, 400, { error: 'Invalid message' });
    }

    const { message, role } = body as { message?: unknown; role?: unknown };
    if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_CHARS) {
      return sendJson(res, 400, { error: 'Invalid message' });
    }

    // The lecturer role (and drafting) is granted only to a verified lecturer, never from the request body.
    const lecturer = role === 'lecturer' ? await authenticateLecturer(req, options.hosted ?? false) : null;
    if (role === 'lecturer' && !lecturer) {
      return sendJson(res, 401, { error: 'Please sign in as a lecturer.' });
    }

    const result = await runAgent(message.trim(), {
      role: lecturer ? 'lecturer' : 'student',
      studentNumber: CURRENT_STUDENT.studentNumber,
      repo,
      allowDrafts: Boolean(lecturer),
    });
    return sendJson(res, 200, result);
  } catch (err) {
    console.error('Agent error:', err);
    return sendJson(res, err instanceof Error && err.message === 'too_large' ? 413 : 500, {
      error: 'Agent failed',
    });
  }
}
