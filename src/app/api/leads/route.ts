import { NextRequest, NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";
import { getSupabaseClient } from "@/lib/supabase";
import { createOrUpdateHubspotContact } from "@/lib/hubspot";
import { processLeadWorkflow } from "@/lib/workflows/processLead";
import crypto from "crypto";

// Rate limiting en memoria (por IP, ventana de 10 min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

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

export async function POST(request: NextRequest) {
    const traceId = generateTraceId();

    try {
        // --- Extraer y hashear IP ---
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
        const ipHash = hashSHA256(ip);

        // --- Rate limiting ---
        const rateCheck = checkRateLimit(ipHash);
        if (!rateCheck.allowed) {
            console.log(JSON.stringify({ traceId, event: "rate_limit_exceeded", ipHash }));
            return NextResponse.json(
                { error: "Demasiados intentos. Intenta más tarde." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateCheck.retryAfter) },
                }
            );
        }

        // --- Parsear body ---
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Body inválido" }, { status: 400 });
        }

        // --- Honeypot check ---
        if (typeof body === "object" && body !== null && "website" in body && (body as Record<string, unknown>).website) {
            // Bot detectado — responder 200 silenciosamente sin persistir
            console.log(JSON.stringify({ traceId, event: "honeypot_triggered", ipHash }));
            return NextResponse.json({ message: "ok" });
        }

        // --- Validación server-side ---
        const parsed = leadSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = parsed.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return NextResponse.json({ error: "Validación fallida", fields: fieldErrors }, { status: 400 });
        }

        const { name, email, goal, risk_profile, experience } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();
        const emailHash = hashSHA256(normalizedEmail);

        console.log(`[Leads] Recibido: ${emailHash}`);

        // --- Obtener UTM params ---
        const url = new URL(request.url);
        const utmSource = url.searchParams.get("utm_source") || request.headers.get("referer")?.split("?")[0] || null;
        const utmMedium = url.searchParams.get("utm_medium") || null;
        const utmCampaign = url.searchParams.get("utm_campaign") || null;

        // --- PRIORIDAD 1: HubSpot (bloqueante) ---
        console.log(`[HubSpot] Intentando crear/actualizar: ${emailHash}`);
        const hubspotResult = await createOrUpdateHubspotContact({
            name,
            email: normalizedEmail,
            goal,
            risk_profile,
            experience,
            source: utmSource || "landing_page",
        });

        if (!hubspotResult.success) {
            console.error(`[HubSpot] Fallo: ${hubspotResult.error} - Email: ${emailHash}`);
            return NextResponse.json(
                { error: "Hubo un problema al enviar. Por favor, inténtalo en unos minutos." },
                { status: 503 }
            );
        }

        console.log(`[HubSpot] Success: ${hubspotResult.contactId} - Email: ${emailHash}`);

        // --- Conexión a Supabase ---
        let supabase;
        try {
            supabase = getSupabaseClient();
        } catch {
            console.error(JSON.stringify({ traceId, event: "supabase_unavailable" }));
            // HubSpot ya funcionó, así que respondemos success al cliente
            return NextResponse.json(
                { message: "¡Evaluación registrada con éxito!" },
                { status: 201 }
            );
        }

        // --- Check duplicado (mismo email en últimos 10 min) ---
        const dedupCutoff = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
        const { data: recentLead } = await supabase
            .from("leads")
            .select("id, created_at")
            .eq("email", normalizedEmail)
            .gte("created_at", dedupCutoff)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (recentLead) {
            console.log(JSON.stringify({ traceId, event: "duplicate_within_window", emailHash }));
            return NextResponse.json(
                { message: "Ya recibimos tu formulario. Diego te contactará pronto." },
                { status: 200 }
            );
        }

        // --- Check idempotencia (mismo email fuera de ventana) ---
        const { data: existingLead } = await supabase
            .from("leads")
            .select("id")
            .eq("email", normalizedEmail)
            .is("deleted_at", null)
            .limit(1)
            .single();

        const isDuplicate = !!existingLead;

        // --- PRIORIDAD 2: Supabase (fire-and-forget) ---
        const supabaseInsert = async () => {
            try {
                const { data: insertedLead, error: insertError } = await supabase
                    .from("leads")
                    .insert({
                        name,
                        email: normalizedEmail,
                        email_hash: emailHash,
                        goal,
                        risk_profile,
                        experience,
                        is_duplicate: isDuplicate,
                        source: utmSource,
                        utm_medium: utmMedium,
                        utm_campaign: utmCampaign,
                        ip_hash: ipHash,
                    })
                    .select("id")
                    .single();

                if (insertError) {
                    console.error(`[Supabase] insert_failed pero no bloquea HubSpot: ${insertError.message}`);
                    return null;
                }

                console.log(JSON.stringify({
                    traceId,
                    event: isDuplicate ? "lead_duplicate_created" : "lead_created",
                    emailHash,
                    leadId: insertedLead.id,
                }));

                return insertedLead;
            } catch (err) {
                console.error(`[Supabase] insert_failed pero no bloquea HubSpot: ${String(err)}`);
                return null;
            }
        };

        // Ejecutar Supabase y workflow en background (sin await)
        supabaseInsert().then((insertedLead) => {
            if (insertedLead && !isDuplicate) {
                processLeadWorkflow(insertedLead.id, {
                    name,
                    email: normalizedEmail,
                    emailHash,
                    goal,
                    risk_profile,
                    experience,
                    source: utmSource || "landing_page",
                }, traceId).catch((err) => {
                    console.error(JSON.stringify({ traceId, event: "workflow_error", error: String(err) }));
                });
            }
        }).catch((err) => {
            console.error(`[Background] Error en cadena Supabase: ${String(err)}`);
        });

        // Responder inmediatamente (HubSpot ya tuvo éxito)
        return NextResponse.json(
            { message: "¡Evaluación registrada con éxito!" },
            { status: 201 }
        );
    } catch (err) {
        console.error(JSON.stringify({ traceId, event: "unhandled_error", error: String(err) }));
        return NextResponse.json(
            { error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}

