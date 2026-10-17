# Elevate Solulu

Academic assistant demo built with React, Vite, and a server-side Gemini API route.

## Run locally

```sh
npm install
npm run dev
```

The app can use its offline demo responses without a Gemini key. To use Gemini,
set `GEMINI_API_KEY` in `.env.local`. Keep this key server-side; do not use a
`VITE_` prefix or commit the key.

## Deploy to Vercel

1. Import this repository into Vercel and select the Vite framework preset.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Add `GEMINI_API_KEY` in the Vercel project's server-side environment variables.
   `GEMINI_MODEL` is optional; it defaults to `gemini-3-flash-preview`.
4. Optional, to send email from the hosted demo, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REFRESH_TOKEN`, `EMAIL_FROM` and `EMAIL_ALLOWED_RECIPIENTS` (comma-separated).
   The hosted demo is send-only: the inbox and replies are disabled, recipients must be in the
   allow-list, and sends are rate limited. Draft approvals are not available online.
5. Deploy and test `/api/agent` through the chatbot.

The `api/agent.ts` function serves the chatbot endpoint, `api/gmail/[...path].ts` the
send-only email endpoint and `api/drafts/` the approval queue.

### Agent-written emails (lecturers)

The agent can write emails for every at-risk student, which a signed-in lecturer approves
before anything is sent. To enable this online:

1. Run `supabase/email_drafts.sql` in the Supabase SQL editor.
2. In Supabase Auth, create a user for the lecturer (email and password).
3. Add these Vercel environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   (server-side only), `LECTURER_EMAILS` (the lecturer's Auth email), `DRAFT_DELIVERY=live`,
   plus the Gmail variables from step 4 above and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Sign in as that lecturer. The server verifies the Supabase token, so only emails listed in
   `LECTURER_EMAILS` can draft or approve. The inbox and replies remain local-only.

## Demo and data notice

Login and lecturer/student roles are demo-only and are not verified by the server.
The app uses sample student records. Anyone with a public deployment link may be
able to use the demo; never enter real student or other confidential data.
Protect and monitor the Gemini API key and its quota.
