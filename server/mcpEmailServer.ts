import 'dotenv/config';
import { google } from 'googleapis';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const studentEmail = process.env.STUDENT_EMAIL || 'maya.sithole.2024@gmail.com';
const lecturerEmail = process.env.LECTURER_EMAIL || 'vasqueelena2026@gmail.com';
const senderEmail = process.env.EMAIL_FROM || studentEmail;
const allowedRecipients = new Set(
  (process.env.EMAIL_ALLOWED_RECIPIENTS || lecturerEmail)
    .split(',')
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean),
);

const emailSchema = {
  to: z.string().email().describe('Recipient address. Must be in EMAIL_ALLOWED_RECIPIENTS.'),
  subject: z.string().min(1).max(998),
  body: z.string().min(1).max(100_000),
  replyTo: z.string().email().optional(),
};

function assertAllowedRecipient(to: string) {
  if (!allowedRecipients.has(to.toLowerCase())) {
    throw new Error(`Recipient is not allowed. Add ${to} to EMAIL_ALLOWED_RECIPIENTS after consent.`);
  }
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createRawMessage({ to, subject, body, replyTo }: z.infer<z.ZodObject<typeof emailSchema>>) {
  const headers = [
    `From: ${senderEmail}`,
    `To: ${to}`,
    `Subject: ${subject.replace(/[\r\n]/g, ' ')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
  ];
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  return encodeBase64Url(`${headers.join('\r\n')}\r\n\r\n${body}`);
}

async function sendWithGmail(input: z.infer<z.ZodObject<typeof emailSchema>>) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret, process.env.GOOGLE_REDIRECT_URI);
  auth.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth });
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: createRawMessage(input) },
  });
  return { provider: 'gmail', messageId: result.data.id || undefined };
}

async function sendWithSmtp(input: z.infer<z.ZodObject<typeof emailSchema>>) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || senderEmail;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !password) return null;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass: password },
  });
  const result = await transporter.sendMail({
    from: senderEmail,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.body,
  });
  return { provider: 'smtp-proxy', messageId: result.messageId };
}

async function sendEmail(input: z.infer<z.ZodObject<typeof emailSchema>>) {
  assertAllowedRecipient(input.to);
  let gmailError: unknown;
  try {
    const gmailResult = await sendWithGmail(input);
    if (gmailResult) return gmailResult;
  } catch (error) {
    gmailError = error;
  }

  const smtpResult = await sendWithSmtp(input);
  if (smtpResult) return smtpResult;
  if (gmailError instanceof Error) {
    throw new Error(`Gmail delivery failed and SMTP proxy is not configured: ${gmailError.message}`);
  }
  throw new Error('Configure Gmail OAuth or SMTP proxy credentials before sending email.');
}

const server = new McpServer({ name: 'solulu-student-email', version: '1.0.0' });

server.registerTool('send_email', {
  description: `Send an email from the authorized student mailbox ${senderEmail}. Delivery uses Gmail OAuth, then an authenticated SMTP relay if Gmail permissions fail.`,
  inputSchema: emailSchema,
}, async (input) => {
  const result = await sendEmail(input);
  return {
    content: [{ type: 'text', text: JSON.stringify({ status: 'SENT', ...result, from: senderEmail, to: input.to }) }],
  };
});

server.registerTool('email_configuration', {
  description: 'Show non-secret email server configuration and the permitted recipient list.',
  inputSchema: {},
}, async () => ({
  content: [{
    type: 'text',
    text: JSON.stringify({
      studentEmail,
      lecturerEmail,
      senderEmail,
      allowedRecipients: [...allowedRecipients],
      gmailConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN),
      smtpProxyConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_PASSWORD),
    }),
  }],
}));

await server.connect(new StdioServerTransport());