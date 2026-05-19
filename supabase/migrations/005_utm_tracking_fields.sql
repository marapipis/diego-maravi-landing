-- Migration: 005_utm_tracking_fields
-- Agrega columnas UTM que faltaban en la tabla leads.
-- utm_medium y utm_campaign ya existían desde 001_create_leads.
-- Se agregan utm_source, utm_content y utm_term para tracking completo.

-- Eliminar constraints si ya existen (safe para re-ejecutar).
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_utm_source_length;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_utm_content_length;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_utm_term_length;

-- Ampliar utm_medium de VARCHAR(50) a VARCHAR(100) (TikTok / campaign names pueden ser largos).
ALTER TABLE leads ALTER COLUMN utm_medium TYPE VARCHAR(100);

-- Nuevas columnas.
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS utm_content  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS utm_term     VARCHAR(100);

-- Índices para filtrar leads por canal en Supabase.
CREATE INDEX IF NOT EXISTS idx_leads_utm_source   ON leads (utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads (utm_campaign);
