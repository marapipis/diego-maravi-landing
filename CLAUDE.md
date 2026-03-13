# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page de captación de leads para **Diego Maravi · Coach Financiero**. Diseño oscuro premium con formulario de evaluación financiera y quiz funnel. El sitio está en español (Perú).

## Commands

```bash
npm run dev      # Dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint (next/core-web-vitals + typescript)
npm start        # Start production server
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) with React 19 and React Compiler enabled
- **Tailwind CSS v4** (PostCSS plugin, no tailwind.config — uses CSS-based config in `globals.css`)
- **TypeScript** with strict mode
- **Supabase** (PostgreSQL) — server-side only via service role key
- **Resend** for transactional emails
- **Amplitude** for client-side analytics
- **Zod** for form validation (shared schema between client and server)

## Architecture

### Data Flow: Lead Submission

1. `LeadForm.tsx` / `QuizFunnel.tsx` → client-side Zod validation → `POST /api/leads` (or `/api/quiz-leads`)
2. API route: rate limit (in-memory, 5/IP/10min) → honeypot check → server Zod validation → dedup check → Supabase insert → fire-and-forget emails via Resend
3. Emails logged to `email_log` table with delivery status

### Key Patterns

- **Form options are centralized** in `config/form-options.ts` — values, labels, and Zod-valid enums all derive from the same source of truth. When adding/changing form options, only edit this file.
- **Validation schemas** in `src/lib/validations.ts` are used both client-side (on-blur per-field) and server-side (full schema parse). The `leadSchema` enum values must match `config/form-options.ts`.
- **Security middleware** (`src/middleware.ts`) sets CSP, X-Frame-Options, and other headers on all non-static routes. Update CSP directives when adding new external services.
- **No PII in logs** — IPs and emails are SHA-256 hashed before logging. Only hashes appear in console output.
- **Emails are fire-and-forget** — `Promise.allSettled` runs after response is sent to avoid blocking the user.

### Database

Migrations live in `supabase/migrations/`. Apply them manually via the Supabase SQL Editor:
- `001_create_leads.sql` — leads table
- `002_create_quiz_leads.sql` — quiz leads table

### Environment

Requires `.env.local` with Supabase, Resend, and coach email credentials. See `.env.example`. The frontend renders without API keys but form submission will fail.

## Style Guidelines (from .agents/rules)

- Plan before coding — propose a structured plan for new/complex features and wait for validation.
- Incremental changes — small, verifiable steps. No massive refactors unless explicitly requested.
- KISS over clever — prioritize readable, simple code.
- Comments explain "why", not "what" — use descriptive variable/function names instead.
- Defensive programming — never assume happy path; handle invalid inputs, unexpected states, external failures.
- Concise communication — no filler, no greetings, go straight to the plan/code/status.
- Flag bad practices — if a request introduces security risks or inefficiencies, stop and propose an alternative.
