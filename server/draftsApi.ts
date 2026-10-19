import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticateLecturer, explainAuthFailure } from './auth.ts';
import { claimDraft, getDraft, listDrafts, updateDraft } from './agent/drafts.ts';
import { demoStudentRecipient, sendApprovedEmail } from './gmailApiPlugin.ts';

const MAX_BODY_BYTES = 10_000;

type DraftsRequest = IncomingMessage & { body?: unknown; query?: Record<string, string | string[] | undefined> };

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req: DraftsRequest): Promise<Record<string, unknown>> {
  let parsed: unknown;
  if (req.body !== undefined) {
    parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } else {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk.toString();
      if (raw.length > MAX_BODY_BYTES) throw new Error('too_large');
    }
    parsed = raw ? JSON.parse(raw) : {};
  }
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
}

// `hosted` (Vercel) requires a verified lecturer token; locally, loopback requests are trusted.
export async function handleDraftsRequest(req: DraftsRequest, res: ServerResponse, hosted = false) {
  try {
    const lecturer = await authenticateLecturer(req, hosted);
    if (!lecturer) {
      return sendJson(res, 401, { error: hosted ? await explainAuthFailure(req) : 'Sign in as a lecturer to manage drafts.' });
    }

    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) {
      return sendJson(res, 403, { error: 'Cross-origin requests are not allowed.' });
    }

    const url = new URL(req.url || '/', 'http://localhost');
    // Vercel's catch-all route can expose the segments as a `path` query value instead of in the URL.
    const queryPath = req.query?.path ?? url.searchParams.getAll('path');
    const fromQuery = (Array.isArray(queryPath) ? queryPath : [queryPath]).flatMap((p) => String(p ?? '').split('/')).filter(Boolean);
    const fromUrl = url.pathname.replace(/^\/api\/drafts/, '').split('/').filter(Boolean);
    const parts = fromUrl.length > 0 && !fromUrl[0].startsWith('[') ? fromUrl : fromQuery;

    if (req.method === 'GET' && parts.length === 0) return sendJson(res, 200, { drafts: await listDrafts() });

    const [id, action] = parts;
    if (req.method !== 'POST' || !id || (action !== 'approve' && action !== 'reject')) {
      return sendJson(res, 404, { error: `Unknown drafts route: ${req.method} /api/drafts/${parts.join('/')}` });
    }

    const draft = await getDraft(id);
    if (!draft) return sendJson(res, 404, { error: 'Draft not found in the database. Refresh the page.' });
    if (draft.status !== 'pending') return sendJson(res, 409, { error: `Draft is already ${draft.status}.` });

    if (action === 'reject') {
      return sendJson(res, 200, { draft: await updateDraft(id, { status: 'rejected', decidedAt: new Date().toISOString() }) });
    }

    const edits = await readJson(req);
    const subject = typeof edits.subject === 'string' && edits.subject.trim() ? edits.subject.trim().slice(0, 200) : draft.subject;
    const body = typeof edits.body === 'string' && edits.body.trim() ? edits.body.trim().slice(0, 5000) : draft.body;
    const decidedAt = new Date().toISOString();

    if (!(await claimDraft(id))) return sendJson(res, 409, { error: 'Draft is already being handled.' });

    if (process.env.DRAFT_DELIVERY !== 'live') {
      const updated = await updateDraft(id, {
        subject,
        body,
        status: 'simulated',
        decidedAt,
        note: 'Approved. Not actually sent: set DRAFT_DELIVERY=live to send for real.',
      });
      return sendJson(res, 200, { draft: updated });
    }

    try {
      // Practice students have no real inbox, so live mode routes to the demo student mailbox.
      const to = demoStudentRecipient();
      await sendApprovedEmail('lecturer', to, subject, body);
      const updated = await updateDraft(id, { subject, body, status: 'sent', decidedAt, note: `Sent to demo mailbox ${to}.` });
      return sendJson(res, 200, { draft: updated });
    } catch (err) {
      console.error('Draft send failed:', err);
      const updated = await updateDraft(id, { subject, body, status: 'failed', decidedAt, note: 'Sending failed. Check the server log.' });
      return sendJson(res, 502, { draft: updated, error: 'Sending failed' });
    }
  } catch (err) {
    console.error('Drafts error:', err);
    return sendJson(res, err instanceof Error && err.message === 'too_large' ? 413 : 500, { error: 'Request failed' });
  }
}
