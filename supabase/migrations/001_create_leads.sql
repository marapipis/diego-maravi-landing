-- Migration: 001_create_leads
-- Crea las tablas leads y email_log para el sistema de captación

CREATE TABLE IF NOT EXISTS leads (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL,
  email_hash      VARCHAR(64)   NOT NULL,
  goal            VARCHAR(20)   NOT NULL
                  CHECK (goal IN ('jubilacion','pasivos','ahorro','libertad')),
  risk_profile    VARCHAR(20)   NOT NULL
                  CHECK (risk_profile IN ('conservador','moderado','agresivo')),
  experience      VARCHAR(10)   NOT NULL
                  CHECK (experience IN ('nada','poco','mucho')),
  is_duplicate    BOOLEAN       NOT NULL DEFAULT FALSE,
  source          VARCHAR(50),
  utm_medium      VARCHAR(50),
  utm_campaign    VARCHAR(100),
  ip_hash         VARCHAR(64),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

CREATE TABLE IF NOT EXISTS email_log (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID          NOT NULL REFERENCES leads(id),
  email_type      VARCHAR(30)   NOT NULL
                  CHECK (email_type IN ('coach_notification','lead_confirmation')),
  status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','failed')),
  provider_id     VARCHAR(100),
  error_message   TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- RLS: solo accesible con service role
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
