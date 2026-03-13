-- Migration 003: Processing & observability tables
-- These tables track HubSpot sync, email delivery, and workflow execution.
-- lead_id has no FK because it references either "leads" or "quiz_leads".

-- ============================================================
-- contact_sync_log: HubSpot sync attempts per lead
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_sync_log (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id            UUID NOT NULL,
    hubspot_contact_id VARCHAR(50),
    status             VARCHAR(10) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'success', 'error')),
    error_message      TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_sync_log_lead_id
    ON contact_sync_log (lead_id);

-- ============================================================
-- email_events: every email sent, with delivery status
-- ============================================================
CREATE TABLE IF NOT EXISTS email_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL,
    email_hash  VARCHAR(64) NOT NULL,
    template    VARCHAR(50) NOT NULL,
    provider    VARCHAR(20) NOT NULL DEFAULT 'resend',
    status      VARCHAR(20) NOT NULL,
    message_id  VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_lead_id
    ON email_events (lead_id);

-- ============================================================
-- workflow_events: each step of the lead processing workflow
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL,
    event_type  VARCHAR(50) NOT NULL,
    status      VARCHAR(20) NOT NULL,
    payload     JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_events_lead_id
    ON workflow_events (lead_id);

CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at
    ON workflow_events (created_at DESC);

-- ============================================================
-- RLS: server-side only (service role key)
-- ============================================================
ALTER TABLE contact_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
