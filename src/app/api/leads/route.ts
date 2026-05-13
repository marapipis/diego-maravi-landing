import { NextRequest, NextResponse } from "next/server";
import { leadSchema, normalizeWhatsapp } from "@/lib/validations";
import { getSupabaseClient } from "@/lib/supabase";
import { createOrUpdateHubspotContact } from "@/lib/hubspot";
import { sendCoachNotification, sendLeadConfirmation } from "@/lib/email";
import { LEAD_SOURCE, LEAD_FUNNEL_STAGE } from "../../../../config/form-options";
import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Rate limiting en memoria (por IP, ventana de 10 min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEDUP_WINDOW_MS = 10 * 60 * 1000;

function hashSHA256(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
}

function generateTraceId(): string {
    return crypto.randomUUID();
}

function checkRateLimit(ipHash: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ipHash);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true };
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfter };
    }

    entry.count++;
    return { allowed: true };
}

// ============================================================
// Integraciones externas — cada una totalmente aislada.
// Devuelven "success" | "failed", nunca lanzan.
// ============================================================

type IntegrationStatus = "success" | "failed" | "skipped";

interface LeadIntegrationsParams {
    supabase: SupabaseClient;
    leadId: string;
    emailHash: string;
    traceId: string;
    fullName: string;
    email: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
    acceptedRiskDisclaimer: boolean;
    source: string;
}

async function runHubspotSync(p: LeadIntegrationsParams): Promise<IntegrationStatus> {
    const hasToken = !!(process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN);
    if (!hasToken) {
        console.warn(`[HubSpot] Skipped (no token configured) — ${p.emailHash}`);
        return "skipped";
    }

    try {
        console.log(`[HubSpot] Creating/updating contact... — ${p.emailHash}`);
        const result = await createOrUpdateHubspotContact({
            fullName: p.fullName,
            email: p.email,
            whatsapp: p.whatsapp,
            country: p.country,
            cryptoExperience: p.cryptoExperience,
            learningInterest: p.learningInterest,
            acceptedRiskDisclaimer: p.acceptedRiskDisclaimer,
            source: p.source,
        });

        if (result.success) {
            console.log(`[HubSpot] Contact synced: ${result.contactId} — ${p.emailHash}`);
        } else {
            console.error(`[HubSpot] Sync failed: ${result.error} — ${p.emailHash}`);
        }

        // Log al contact_sync_log (no bloquea si falla)
        try {
            await p.supabase.from("contact_sync_log").insert({
                lead_id: p.leadId,
                hubspot_contact_id: result.contactId || null,
                status: result.success ? "success" : "error",
                error_message: result.error || null,
            });
        } catch (logErr) {
            console.error(`[HubSpot] contact_sync_log insert failed: ${String(logErr)}`);
        }

        return result.success ? "success" : "failed";
    } catch (err) {
        console.error(`[HubSpot] Unexpected error: ${String(err)} — ${p.emailHash}`);
        return "failed";
    }
}

async function runHubspotWebhook(p: LeadIntegrationsParams): Promise<IntegrationStatus> {
    const webhookUrl = process.env.HUBSPOT_WEBHOOK_URL;

    if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
        console.warn(`[HubSpot Webhook] Skipped (no URL configured) — ${p.emailHash}`);
        return "skipped";
    }

    try {
        console.log(`[HubSpot Webhook] Sending to ${webhookUrl}... — ${p.emailHash}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                leadId: p.leadId,
                fullName: p.fullName,
                email: p.email,
                whatsapp: p.whatsapp,
                country: p.country,
                cryptoExperience: p.cryptoExperience,
                learningInterest: p.learningInterest,
                source: p.source,
                funnelStage: LEAD_FUNNEL_STAGE,
                createdAt: new Date().toISOString(),
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error(`[HubSpot Webhook] Failed: status=${res.status}, body=${body.slice(0, 300)} — ${p.emailHash}`);
            return "failed";
        }

        console.log(`[HubSpot Webhook] OK (status=${res.status}) — ${p.emailHash}`);
        return "success";
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[HubSpot Webhook] Fetch failed: ${errMsg} — ${p.emailHash}`);
        return "failed";
    }
}

async function runEmails(p: LeadIntegrationsParams): Promise<IntegrationStatus> {
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const hasFromEmail = !!process.env.FROM_EMAIL;
    const hasCoachEmail = !!process.env.COACH_EMAIL;

    if (!hasResendKey || !hasFromEmail) {
        console.warn(`[Email] Skipped (missing RESEND_API_KEY or FROM_EMAIL) — ${p.emailHash}`);
        return "skipped";
    }

    const leadData = {
        fullName: p.fullName,
        email: p.email,
        whatsapp: p.whatsapp,
        country: p.country,
        cryptoExperience: p.cryptoExperience,
        learningInterest: p.learningInterest,
    };

    let coachOk = false;
    let confirmationOk = false;

    // Coach notification
    if (hasCoachEmail) {
        try {
            console.log(`[Email] Sending coach notification... — ${p.emailHash}`);
            const r = await sendCoachNotification(leadData);
            coachOk = r.success;
            console.log(`[Email] Coach notification ${coachOk ? "sent" : "failed"} — ${p.emailHash}`);

            try {
                await p.supabase.from("email_events").insert({
                    lead_id: p.leadId,
                    email_hash: p.emailHash,
                    template: "coach_notification",
                    provider: "resend",
                    status: coachOk ? "sent" : "failed",
                    message_id: r.providerId || null,
                });
            } catch (logErr) {
                console.error(`[Email] email_events (coach) insert failed: ${String(logErr)}`);
            }
        } catch (err) {
            console.error(`[Email] Coach notification error: ${String(err)} — ${p.emailHash}`);
        }
    } else {
        console.warn(`[Email] Coach notification skipped (no COACH_EMAIL) — ${p.emailHash}`);
    }

    // Lead confirmation
    try {
        console.log(`[Email] Sending lead confirmation... — ${p.emailHash}`);
        const r = await sendLeadConfirmation(leadData);
        confirmationOk = r.success;
        console.log(`[Email] Lead confirmation ${confirmationOk ? "sent" : "failed"} — ${p.emailHash}`);

        try {
            await p.supabase.from("email_events").insert({
                lead_id: p.leadId,
                email_hash: p.emailHash,
                template: "lead_confirmation",
                provider: "resend",
                status: confirmationOk ? "sent" : "failed",
                message_id: r.providerId || null,
            });
        } catch (logErr) {
            console.error(`[Email] email_events (confirmation) insert failed: ${String(logErr)}`);
        }
    } catch (err) {
        console.error(`[Email] Lead confirmation error: ${String(err)} — ${p.emailHash}`);
    }

    return coachOk || confirmationOk ? "success" : "failed";
}

// Workflow event logger (silencioso si falla)
async function logWorkflowEvent(
    supabase: SupabaseClient,
    leadId: string,
    eventType: string,
    status: string,
    payload?: Record<string, unknown>,
): Promise<void> {
    try {
        await supabase.from("workflow_events").insert({
            lead_id: leadId,
            event_type: eventType,
            status,
            payload: payload || {},
        });
    } catch (err) {
        console.error(`[workflow] log ${eventType} failed: ${String(err)}`);
    }
}

// Coordina todas las integraciones externas. Cada una está aislada — nunca lanza.
async function runAllIntegrations(p: LeadIntegrationsParams): Promise<{
    hubspot: IntegrationStatus;
    webhook: IntegrationStatus;
    email: IntegrationStatus;
}> {
    await logWorkflowEvent(p.supabase, p.leadId, "workflow_started", "started");

    // Ejecutar las 3 integraciones en paralelo, totalmente aisladas
    const [hubspotResult, webhookResult, emailResult] = await Promise.allSettled([
        runHubspotSync(p),
        runHubspotWebhook(p),
        runEmails(p),
    ]);

    const hubspot = hubspotResult.status === "fulfilled" ? hubspotResult.value : "failed";
    const webhook = webhookResult.status === "fulfilled" ? webhookResult.value : "failed";
    const email = emailResult.status === "fulfilled" ? emailResult.value : "failed";

    await logWorkflowEvent(p.supabase, p.leadId, "workflow_complete", "success", {
        hubspot,
        webhook,
        email,
    });

    console.log(
        `[Workflow] Complete — hubspot=${hubspot}, webhook=${webhook}, email=${email} — ${p.emailHash}`
    );

    return { hubspot, webhook, email };
}

// ============================================================
// Endpoint principal
// ============================================================
export async function POST(request: NextRequest) {
    const traceId = generateTraceId();

    try {
        // --- IP / Rate limiting ---
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
        const ipHash = hashSHA256(ip);

        const rateCheck = checkRateLimit(ipHash);
        if (!rateCheck.allowed) {
            console.log(JSON.stringify({ traceId, event: "rate_limit_exceeded", ipHash }));
            return NextResponse.json(
                { error: "Demasiados intentos. Intenta más tarde." },
                { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
            );
        }

        // --- Parsear body ---
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Body inválido" }, { status: 400 });
        }

        // --- Honeypot ---
        if (
            typeof body === "object" &&
            body !== null &&
            "website" in body &&
            (body as Record<string, unknown>).website
        ) {
            console.log(JSON.stringify({ traceId, event: "honeypot_triggered", ipHash }));
            return NextResponse.json({ message: "ok" });
        }

        // --- Validación Zod ---
        const parsed = leadSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = parsed.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return NextResponse.json(
                { error: "Validación fallida", fields: fieldErrors },
                { status: 400 }
            );
        }

        const {
            fullName,
            email,
            whatsapp,
            country,
            cryptoExperience,
            learningInterest,
            acceptedRiskDisclaimer,
        } = parsed.data;

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
        const emailHash = hashSHA256(normalizedEmail);

        // --- UTM ---
        const url = new URL(request.url);
        const utmSource =
            url.searchParams.get("utm_source") ||
            request.headers.get("referer")?.split("?")[0] ||
            null;
        const utmMedium = url.searchParams.get("utm_medium") || null;
        const utmCampaign = url.searchParams.get("utm_campaign") || null;
        const source = utmSource || LEAD_SOURCE;

        console.log(`[Leads] Received: ${emailHash} — trace=${traceId}`);

        // ============================================================
        // PRIORIDAD 1: Supabase — bloqueante, fuente principal de captura
        // ============================================================
        let supabase: SupabaseClient;
        try {
            supabase = getSupabaseClient();
        } catch (err) {
            console.error(`[Supabase] Client unavailable: ${String(err)} — trace=${traceId}`);
            return NextResponse.json(
                { error: "No se pudo procesar tu registro. Inténtalo en unos segundos." },
                { status: 503 }
            );
        }

        // Dedupe + idempotencia (no fatales si fallan)
        let isDuplicate = false;
        try {
            const dedupCutoff = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
            const { data: recentLead } = await supabase
                .from("leads")
                .select("id, created_at")
                .eq("email", normalizedEmail)
                .gte("created_at", dedupCutoff)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (recentLead) {
                console.log(`[Leads] Duplicate within window — ${emailHash}`);
                return NextResponse.json(
                    {
                        success: true,
                        message: "Ya recibimos tu registro. Revisa tu correo en los próximos minutos.",
                    },
                    { status: 200 }
                );
            }

            const { data: existingLead } = await supabase
                .from("leads")
                .select("id")
                .eq("email", normalizedEmail)
                .is("deleted_at", null)
                .limit(1)
                .maybeSingle();

            isDuplicate = !!existingLead;
        } catch (err) {
            console.warn(`[Dedup] Check failed, continuing: ${String(err)} — ${emailHash}`);
        }

        // Insertar lead en Supabase (CRÍTICO)
        let leadId: string;
        try {
            const { data: insertedLead, error: insertError } = await supabase
                .from("leads")
                .insert({
                    name: fullName,
                    email: normalizedEmail,
                    email_hash: emailHash,
                    whatsapp: normalizedWhatsapp,
                    country,
                    crypto_experience: cryptoExperience,
                    learning_interest: learningInterest,
                    accepted_risk_disclaimer: acceptedRiskDisclaimer,
                    funnel_stage: LEAD_FUNNEL_STAGE,
                    is_duplicate: isDuplicate,
                    source,
                    utm_medium: utmMedium,
                    utm_campaign: utmCampaign,
                    ip_hash: ipHash,
                })
                .select("id")
                .single();

            if (insertError || !insertedLead) {
                throw new Error(insertError?.message || "Insert returned no data");
            }

            leadId = insertedLead.id;
            console.log(`[Supabase] Lead created: ${leadId} — ${emailHash}`);
        } catch (err) {
            console.error(`[Supabase] insert_failed: ${String(err)} — ${emailHash}`);
            return NextResponse.json(
                { error: "No se pudo guardar tu registro. Inténtalo de nuevo." },
                { status: 500 }
            );
        }

        // ============================================================
        // PRIORIDAD 2: Integraciones externas — todas aisladas, no bloqueantes
        // Las llamamos con await para tener warnings precisos en la respuesta,
        // pero CADA UNA tiene su propio try/catch y NUNCA propaga errores.
        // ============================================================
        const warnings = isDuplicate
            ? { hubspot: "skipped" as IntegrationStatus, webhook: "skipped" as IntegrationStatus, email: "skipped" as IntegrationStatus }
            : await runAllIntegrations({
                  supabase,
                  leadId,
                  emailHash,
                  traceId,
                  fullName,
                  email: normalizedEmail,
                  whatsapp: normalizedWhatsapp,
                  country,
                  cryptoExperience,
                  learningInterest,
                  acceptedRiskDisclaimer,
                  source,
              });

        // ============================================================
        // Respuesta de éxito — Supabase guardó el lead, eso es lo que importa
        // ============================================================
        return NextResponse.json(
            {
                success: true,
                leadId,
                message: "Registro recibido correctamente.",
                warnings,
            },
            { status: 201 }
        );
    } catch (err) {
        // Última red de seguridad — si algo se escapa, no rompemos al usuario
        console.error(
            JSON.stringify({ traceId, event: "unhandled_error", error: String(err) })
        );
        return NextResponse.json(
            { error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
