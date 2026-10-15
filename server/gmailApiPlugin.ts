import type { IncomingMessage, ServerResponse } from 'node:http';
import { google, type gmail_v1 } from 'googleapis';
import type { Plugin } from 'vite';

const GMAIL_READ_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

function header(message: gmail_v1.Schema$Message, name: string) {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

function parseSender(value: string) {
  const match = value.match(/^(.*?)\s*<([^<>]+)>$/);
  if (match) {
    return {
      fromName: match[1].replace(/^"|"$/g, '').trim() || match[2],
      from: match[2].trim(),
    };
  }
  const email = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || value;
  return { from: email.trim(), fromName: email.trim() };
}

function decodeBody(data?: string | null) {
  return data ? Buffer.from(data, 'base64url').toString('utf8') : '';
}

function findTextBody(part?: gmail_v1.Schema$MessagePart): string {
  if (!part) return '';
  if (part.mimeType === 'text/plain' && part.body?.data) return decodeBody(part.body.data);
  for (const child of part.parts || []) {
    const text = findTextBody(child);
    if (text) return text;
  }
  if (part.mimeType === 'text/html' && part.body?.data) {
    return decodeBody(part.body.data)
      .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>|<\/(div|p|li|tr|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return '';
}

function categorize(subject: string, snippet: string): 'academic' | 'exams' | 'alerts' | 'general' {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/\b(exam|examination|timetable|test date)\b/.test(text)) return 'exams';
  if (/\b(alert|attendance|verified|notification|reminder)\b/.test(text)) return 'alerts';
  if (/\b(assignment|grade|feedback|module|lecturer|consultation|tutorial)\b/.test(text)) return 'academic';
  return 'general';
}

function toEmail(message: gmail_v1.Schema$Message, includeBody: boolean) {
  const subject = header(message, 'Subject') || '(no subject)';
  const snippet = message.snippet || '';
  const sentAt = message.internalDate ? new Date(Number(message.internalDate)) : new Date();
  const sender = parseSender(header(message, 'From'));
  return {
    id: message.id || '',
    from: sender.from,
    fromName: sender.fromName,
    to: header(message, 'To') || process.env.EMAIL_FROM || '',
    subject,
    snippet,
    body: includeBody ? findTextBody(message.payload) || snippet : snippet,
    date: sentAt.toLocaleDateString(),
    time: sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isUnread: message.labelIds?.includes('UNREAD') || false,
    isStarred: message.labelIds?.includes('STARRED') || false,
    category: categorize(subject, snippet),
    tags: (message.labelIds || []).filter((label) => !['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT'].includes(label)),
    replies: [],
  };
}

function getGmailClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail OAuth credentials are not configured. Check the server .env file.');
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth });
}

function isLoopback(address?: string) {
  return address === '::1' || address === '127.0.0.1' || address === '::ffff:127.0.0.1';
}

function sendJson(res: ServerResponse, status: number, value: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(value));
}

type Role = 'student' | 'lecturer';

function parseRole(value: unknown): Role {
  return value === 'lecturer' ? 'lecturer' : 'student';
}

// Gmail delivers user+tag@domain to user@domain, so one mailbox can act as two people.
function roleAddress(role: Role) {
  const base = (process.env.EMAIL_FROM || '').trim();
  const at = base.lastIndexOf('@');
  if (at < 1) return base;
  const local = base.slice(0, at).split('+')[0];
  return `${local}+${role}${base.slice(at)}`;
}

function getAllowedRecipients() {
  const allowed = new Set(
    (process.env.EMAIL_ALLOWED_RECIPIENTS || process.env.EMAIL_FROM || '')
      .split(',')
      .map((address) => address.trim().toLowerCase())
      .filter(Boolean),
  );
  if (process.env.EMAIL_FROM) {
    allowed.add(roleAddress('student').toLowerCase());
    allowed.add(roleAddress('lecturer').toLowerCase());
  }
  return allowed;
}

function sendRoleEmail(gmail: gmail_v1.Gmail, role: Role, to: string, subject: string, body: string) {
  const rawMessage = Buffer.from([
    `From: ${roleAddress(role)}`,
    `To: ${to}`,
    `Subject: ${subject.replace(/[\r\n]/g, ' ')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body.trim(),
  ].join('\r\n')).toString('base64url');
  return gmail.users.messages.send({ userId: 'me', requestBody: { raw: rawMessage } });
}

// Used by the draft approval flow; recipients must pass the same allow-list as /api/gmail/send.
export async function sendApprovedEmail(role: Role, to: string, subject: string, body: string) {
  if (!getAllowedRecipients().has(to.toLowerCase())) {
    throw new Error('That recipient is not in EMAIL_ALLOWED_RECIPIENTS.');
  }
  const sent = await sendRoleEmail(getGmailClient(), role, to, subject, body);
  return sent.data.id;
}

export function demoStudentRecipient() {
  return roleAddress('student');
}

type GmailRequest = IncomingMessage & { body?: unknown };

const HOSTED_MAX_BODY_CHARS = 5_000;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_SENDS = 5;
const sendLog = new Map<string, number[]>();

// Best-effort limit: serverless instances don't share memory, so this only slows down casual abuse.
function rateLimited(req: IncomingMessage) {
  const forwarded = req.headers['x-forwarded-for'];
  const key = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() ||
    req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (sendLog.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_SENDS) {
    sendLog.set(key, recent);
    return true;
  }
  recent.push(now);
  sendLog.set(key, recent);
  return false;
}

async function readBody(req: GmailRequest, maxChars: number): Promise<Record<string, unknown>> {
  let parsed: unknown;
  if (req.body !== undefined) {
    parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } else {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk.toString();
      if (raw.length > maxChars + 2_000) throw new Error('too_large');
    }
    parsed = raw ? JSON.parse(raw) : {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad_body');
  return parsed as Record<string, unknown>;
}

// `hosted` is true on Vercel: send-only, no inbox access, and requests are not limited to localhost.
export async function handleGmailRequest(req: GmailRequest, res: ServerResponse, hosted = false) {
  const url = new URL(req.url || '/', 'http://localhost');
  const origin = req.headers.origin;
  const originHost = origin ? new URL(origin).host : '';
  const host = req.headers.host || '';

  if (hosted) {
    if (origin && originHost !== host) {
      sendJson(res, 403, { error: 'Cross-origin requests are not allowed.' });
      return;
    }
  } else if (!isLoopback(req.socket.remoteAddress) ||
      !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) ||
      (origin && originHost !== host)) {
    sendJson(res, 403, { error: 'Gmail API is available only from this computer.' });
    return;
  }

  try {
    if (req.method === 'GET' && url.pathname === '/api/gmail/status') {
      getGmailClient();
      const role = parseRole(url.searchParams.get('role'));
      sendJson(res, 200, { account: roleAddress(role), connected: true });
      return;
    }

    if (hosted && req.method === 'GET' && url.pathname === '/api/gmail/messages') {
      sendJson(res, 200, { messages: [] });
      return;
    }
    if (hosted && url.pathname !== '/api/gmail/send') {
      sendJson(res, 403, { error: 'Reading the inbox and replying are disabled in the online demo. Use Compose to send an email.' });
      return;
    }

    const gmail = getGmailClient();
    if (req.method === 'GET' && url.pathname === '/api/gmail/messages') {
      const query = url.searchParams.get('q')?.trim();
      const result = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults: 40,
        q: query || undefined,
      });
      const messages = await Promise.all((result.data.messages || []).map(async ({ id }) => {
        if (!id) return null;
        const response = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });
        return toEmail(response.data, false);
      }));
      const role = parseRole(url.searchParams.get('role'));
      const lecturerAddress = roleAddress('lecturer').toLowerCase();
      const visible = messages.filter((message): message is NonNullable<typeof message> => {
        if (!message) return false;
        const addressedToLecturer = message.to.toLowerCase().includes(lecturerAddress);
        return role === 'lecturer' ? addressedToLecturer : !addressedToLecturer;
      });
      sendJson(res, 200, { messages: visible });
      return;
    }

    const detailMatch = url.pathname.match(/^\/api\/gmail\/messages\/([\w-]+)$/);
    if (req.method === 'GET' && detailMatch) {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: detailMatch[1],
        format: 'full',
      });
      sendJson(res, 200, toEmail(response.data, true));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gmail/send') {
      const maxChars = hosted ? HOSTED_MAX_BODY_CHARS : 100_000;
      const input = await readBody(req, maxChars) as { to?: string; subject?: string; body?: string; role?: string };
      const role = parseRole(input.role);
      const to = typeof input.to === 'string' ? input.to.trim() : '';
      const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ||
          !getAllowedRecipients().has(to.toLowerCase())) {
        sendJson(res, 403, { error: 'That recipient is not in EMAIL_ALLOWED_RECIPIENTS.' });
        return;
      }
      if (!subject || subject.length > 998 ||
          typeof input.body !== 'string' || !input.body.trim() || input.body.length > maxChars) {
        sendJson(res, 400, { error: 'A subject and non-empty email body are required.' });
        return;
      }
      if (hosted && rateLimited(req)) {
        sendJson(res, 429, { error: 'Too many emails sent. Please wait a few minutes and try again.' });
        return;
      }
      const sent = await sendRoleEmail(gmail, role, to, subject, input.body);
      sendJson(res, 200, { messageId: sent.data.id, to, subject });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gmail/replies') {
      const input = await readBody(req, 100_000) as { messageId?: string; body?: string; role?: string };
      const role = parseRole(input.role);
      if (!input.messageId || !/^[\w-]+$/.test(input.messageId) ||
          typeof input.body !== 'string' || !input.body.trim() || input.body.length > 100_000) {
        sendJson(res, 400, { error: 'A Gmail message ID and non-empty reply body are required.' });
        return;
      }
      const original = (await gmail.users.messages.get({
        userId: 'me',
        id: input.messageId,
        format: 'metadata',
        metadataHeaders: ['From', 'Reply-To', 'Subject', 'Message-ID', 'References'],
      })).data;
      const recipient = parseSender(header(original, 'Reply-To') || header(original, 'From')).from;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        sendJson(res, 400, { error: 'The sender address on the original message is invalid.' });
        return;
      }
      if (!getAllowedRecipients().has(recipient.toLowerCase())) {
        sendJson(res, 403, { error: `Reply recipient ${recipient} is not in EMAIL_ALLOWED_RECIPIENTS.` });
        return;
      }
      const subject = header(original, 'Subject') || '';
      const replySubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
      const originalMessageId = header(original, 'Message-ID');
      const references = [header(original, 'References'), originalMessageId].filter(Boolean).join(' ');
      const headers = [
        `From: ${roleAddress(role)}`,
        `To: ${recipient}`,
        `Subject: ${replySubject.replace(/[\r\n]/g, ' ')}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
      ];
      if (originalMessageId) headers.push(`In-Reply-To: ${originalMessageId}`);
      if (references) headers.push(`References: ${references}`);
      const message = Buffer.from(`${headers.join('\r\n')}\r\n\r\n${input.body.trim()}`)
        .toString('base64url');
      const sent = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: message, threadId: original.threadId || undefined },
      });
      sendJson(res, 200, { messageId: sent.data.id, to: recipient, subject: replySubject });
      return;
    }

    sendJson(res, 404, { error: 'Gmail API endpoint not found.' });
  } catch (error) {
    console.error('Gmail API request failed:', error);
    if (error instanceof Error && error.message === 'too_large') {
      sendJson(res, 413, { error: 'Email is too large.' });
      return;
    }
    if (error instanceof SyntaxError || (error instanceof Error && error.message === 'bad_body')) {
      sendJson(res, 400, { error: 'Invalid request.' });
      return;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 403 &&
        'message' in error && typeof error.message === 'string' &&
        error.message.includes('insufficient authentication scopes')) {
      sendJson(res, 403, {
        error: 'Gmail inbox access is not authorized yet. Add the Gmail read-only scope in Google Auth Platform, then authorize Solulu again.',
      });
      return;
    }
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : 'Gmail API request failed.',
    });
  }
}

export function gmailApiPlugin(): Plugin {
  return {
    name: 'solulu-gmail-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!(req.url || '').startsWith('/api/gmail')) {
          next();
          return;
        }
        void handleGmailRequest(req, res);
      });
    },
  };
}

export const gmailScopes = [GMAIL_READ_SCOPE, GMAIL_SEND_SCOPE];
