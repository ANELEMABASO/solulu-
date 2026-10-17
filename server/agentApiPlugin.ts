import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { handleAgentRequest } from './agent/handler.ts';
import { getDraft, listDrafts, updateDraft } from './agent/drafts.ts';
import { demoStudentRecipient, sendApprovedEmail } from './gmailApiPlugin.ts';

const MAX_BODY_BYTES = 10_000;

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function isLocalRequest(req: IncomingMessage) {
  const address = req.socket.remoteAddress;
  const loopback = address === '::1' || address === '127.0.0.1' || address === '::ffff:127.0.0.1';
  const host = req.headers.host || '';
  const origin = req.headers.origin;
  return (
    loopback &&
    /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) &&
    (!origin || new URL(origin).host === host)
  );
}

async function readJson(req: IncomingMessage) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString();
    if (raw.length > MAX_BODY_BYTES) throw new Error('too_large');
  }
  return raw ? JSON.parse(raw) : {};
}

async function handleDrafts(req: IncomingMessage, res: ServerResponse) {
  if (!isLocalRequest(req)) return sendJson(res, 403, { error: 'Approvals are available only from this computer.' });

  const url = new URL(req.url || '/', 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && parts.length === 0) return sendJson(res, 200, { drafts: listDrafts() });

  const [id, action] = parts;
  if (req.method !== 'POST' || !id || (action !== 'approve' && action !== 'reject')) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  const draft = getDraft(id);
  if (!draft) return sendJson(res, 404, { error: 'Draft not found' });
  if (draft.status !== 'pending') return sendJson(res, 409, { error: `Draft is already ${draft.status}.` });

  if (action === 'reject') {
    return sendJson(res, 200, { draft: updateDraft(id, { status: 'rejected', decidedAt: new Date().toISOString() }) });
  }

  const edits = await readJson(req);
  const subject = typeof edits.subject === 'string' && edits.subject.trim() ? edits.subject.trim().slice(0, 200) : draft.subject;
  const body = typeof edits.body === 'string' && edits.body.trim() ? edits.body.trim().slice(0, 5000) : draft.body;
  const decidedAt = new Date().toISOString();

  if (process.env.DRAFT_DELIVERY !== 'live') {
    const updated = updateDraft(id, {
      subject,
      body,
      status: 'simulated',
      decidedAt,
      note: 'Approved. Not actually sent: set DRAFT_DELIVERY=live in .env.local to send for real.',
    });
    return sendJson(res, 200, { draft: updated });
  }

  try {
    // Practice students have no real inbox, so live mode routes to the demo student mailbox.
    const to = demoStudentRecipient();
    await sendApprovedEmail('lecturer', to, subject, body);
    const updated = updateDraft(id, { subject, body, status: 'sent', decidedAt, note: `Sent to demo mailbox ${to}.` });
    return sendJson(res, 200, { draft: updated });
  } catch (err) {
    console.error('Draft send failed:', err);
    const updated = updateDraft(id, { subject, body, status: 'failed', decidedAt, note: 'Sending failed. Check the server log.' });
    return sendJson(res, 502, { draft: updated, error: 'Sending failed' });
  }
}

export function agentApiPlugin(): Plugin {
  return {
    name: 'solulu-agent-api',
    configureServer(server) {
      server.middlewares.use('/api/drafts', (req, res) => {
        handleDrafts(req, res).catch((err) => {
          console.error('Drafts error:', err);
          sendJson(res, err?.message === 'too_large' ? 413 : 500, { error: 'Request failed' });
        });
      });

      server.middlewares.use('/api/agent', handleAgentRequest);
    },
  };
}
