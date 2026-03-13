CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Permitir inserciones (POST) para los leads entrantes libre de autenticación
CREATE POLICY "Allow public insert to quiz_leads" ON public.quiz_leads
  FOR INSERT WITH CHECK (true);
