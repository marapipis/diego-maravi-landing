# Diego Maravi · Coach Financiero — Landing Page

Landing page de captación de leads para coaching financiero. Diseño oscuro premium con formulario de evaluación financiera gratuita.

## Stack

- **Frontend:** Next.js 14+ (App Router) + Tailwind CSS v4 + TypeScript
- **Backend:** Next.js API Routes
- **Base de Datos:** Supabase (PostgreSQL)
- **Email:** Resend
- **Analítica:** Amplitude

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Configurar las variables en .env.local (ver sección abajo)

# 4. Crear tablas en Supabase
# Ejecutar el SQL de supabase/migrations/001_create_leads.sql en el SQL Editor de Supabase

# 5. Iniciar en desarrollo
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `SUPABASE_URL` | URL del proyecto Supabase | Sí (para API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase | Sí (para API) |
| `RESEND_API_KEY` | API key de Resend | Sí (para emails) |
| `COACH_EMAIL` | Email de Diego Maravi | Sí (para notificaciones) |
| `FROM_EMAIL` | Email remitente | Sí |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | API key de Amplitude | Opcional |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio | Opcional |

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/leads/route.ts     # POST /api/leads
│   ├── globals.css            # Sistema de diseño
│   ├── layout.tsx             # Layout raíz + SEO
│   └── page.tsx               # Página principal
├── components/
│   ├── Hero.tsx               # Sección hero + formulario
│   ├── LeadForm.tsx           # Formulario de 5 campos
│   ├── Navbar.tsx             # Navegación + logo
│   ├── SuccessMessage.tsx     # Confirmación post-envío
│   └── Ticker.tsx             # Barra de precios animada
├── lib/
│   ├── analytics.ts           # Wrapper Amplitude
│   ├── email.ts               # Envío con Resend
│   ├── supabase.ts            # Cliente Supabase
│   └── validations.ts         # Schemas Zod
├── middleware.ts              # Headers de seguridad
config/
└── form-options.ts            # Opciones de selects
supabase/
└── migrations/
    └── 001_create_leads.sql   # Schema de BD
```

## Deploy

```bash
# Build de producción
npm run build

# O deploy en Vercel
npx vercel
```

Configurar las mismas variables de entorno en el dashboard de Vercel antes del deploy.

## Notas

- La imagen del coach en `public/coach-diego.png` es un placeholder. Reemplazar con la foto real de Diego.
- El frontend funciona sin las API keys configuradas (el formulario se renderiza pero el submit fallará).
- Rate limiting: 5 requests por IP cada 10 minutos.
- Deduplicación: mismo email en 10 min → HTTP 409.
