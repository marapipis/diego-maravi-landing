-- Migration: 004_crypto_lead_fields
-- Adapta la tabla `leads` al nuevo funnel cripto (Bitunix).
-- Mantiene compatibilidad con datos históricos: las columnas viejas se vuelven nullable.

-- 1) Relajar NOT NULL en columnas del funnel antiguo (jubilación / coaching).
--    Se conservan para no perder datos; los nuevos leads las dejan en NULL.
ALTER TABLE leads ALTER COLUMN goal DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN risk_profile DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN experience DROP NOT NULL;

-- 2) Relajar CHECK constraints existentes (permiten NULL pero se mantienen valores válidos).
--    PostgreSQL no permite ALTER CHECK directamente; se reemplaza por DROP + ADD.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_goal_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_risk_profile_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_experience_check;

-- 3) Nuevas columnas del funnel cripto.
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS whatsapp                  VARCHAR(20),
    ADD COLUMN IF NOT EXISTS country                   VARCHAR(8),
    ADD COLUMN IF NOT EXISTS crypto_experience         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS learning_interest         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS accepted_risk_disclaimer  BOOLEAN     DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS funnel_stage              VARCHAR(80) DEFAULT 'Lead nuevo - Guía cripto solicitada';

-- 4) CHECK constraints suaves para los nuevos enums.
ALTER TABLE leads
    ADD CONSTRAINT leads_crypto_experience_check
    CHECK (crypto_experience IS NULL OR crypto_experience IN ('ninguna','basica','intermedia'));

ALTER TABLE leads
    ADD CONSTRAINT leads_learning_interest_check
    CHECK (learning_interest IS NULL OR learning_interest IN ('fundamentos','spot','futuros','analisis'));

-- 5) Índice secundario por WhatsApp (lookup de duplicados).
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads (whatsapp);
