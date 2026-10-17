-- Email drafts written by the Solulu agent and approved by a lecturer.
-- Only the server (service_role key) touches this table: RLS is on with no policies,
-- so the anon/public key cannot read or write it.
CREATE TABLE IF NOT EXISTS public.email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number VARCHAR(20) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    module_code VARCHAR(20) NOT NULL,
    to_address VARCHAR(200) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sending', 'sent', 'simulated', 'rejected', 'failed')),
    note TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

-- At most one pending draft per student and module.
CREATE UNIQUE INDEX IF NOT EXISTS email_drafts_one_pending
    ON public.email_drafts (student_number, module_code) WHERE status = 'pending';
