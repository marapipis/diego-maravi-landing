-- Migration: 004_crypto_lead_fields
-- Adapta la tabla `leads` al nuevo funnel cripto (Bitunix).
-- Mantiene compatibilidad con datos históricos: las columnas viejas se vuelven nullable.

-- 1) Relajar NOT NULL en columnas del funnel antiguo.
-- Se conservan para no perder datos; los nuevos leads las dejan en NULL.
ALTER TABLE leads ALTER COLUMN goal DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN risk_profile DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN experience DROP NOT NULL;

-- 2) Relajar CHECK constraints existentes del funnel antiguo.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_goal_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_risk_profile_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_experience_check;

-- 3) Eliminar constraints nuevas si ya existen, para que la migración sea re-ejecutable.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_crypto_experience_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_learning_interest_check;

-- 4) Nuevas columnas del funnel cripto.
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS whatsapp                  VARCHAR(30),
    ADD COLUMN IF NOT EXISTS country                   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS crypto_experience         VARCHAR(30),
    ADD COLUMN IF NOT EXISTS learning_interest         VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accepted_risk_disclaimer  BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS funnel_stage              VARCHAR(100) DEFAULT 'Lead nuevo - Guía cripto solicitada';

-- 5) CHECK constraints suaves para los nuevos enums.
-- Estos valores deben coincidir con los valores que envía el formulario.
ALTER TABLE leads
    ADD CONSTRAINT leads_crypto_experience_check
    CHECK (
        crypto_experience IS NULL 
        OR crypto_experience IN ('ninguna', 'basica', 'intermedia')
    );

ALTER TABLE leads
    ADD CONSTRAINT leads_learning_interest_check
    CHECK (
        learning_interest IS NULL 
        OR learning_interest IN ('fundamentos', 'seguridad', 'spot', 'futuros', 'bitunix', 'analisis')
    );

-- 6) Índice secundario por WhatsApp para búsqueda de posibles duplicados.
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads (whatsapp);