import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { processQuizLeadWorkflow } from "@/lib/workflows/processLead";
import crypto from "crypto";

function generateTraceId(): string {
    return crypto.randomUUID().split("-")[0];
}

function hashSHA256(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
    const traceId = generateTraceId();

    try {
        const body = await request.json();
        const { name, email, answers } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: "Nombre y email son requeridos" },
                { status: 400 },
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const emailHash = hashSHA256(normalizedEmail);

        console.log(JSON.stringify({ traceId, event: "quiz_lead_received", emailHash }));

        // Save to Supabase
        let supabase;
        try {
            supabase = getSupabaseClient();
            const { data: insertedLead, error: insertError } = await supabase
                .from("quiz_leads")
                .insert({
                    name,
                    email: normalizedEmail,
                    answers: answers || {},
                })
                .select("id")
                .single();

            if (insertError) {
                console.error(JSON.stringify({ traceId, event: "quiz_insert_failed", error: insertError.message }));
            } else {
                console.log(JSON.stringify({ traceId, event: "quiz_lead_saved" }));

                // Fire-and-forget: background workflow
                if (insertedLead) {
                    processQuizLeadWorkflow(insertedLead.id, {
                        name,
                        email: normalizedEmail,
                        emailHash,
                        answers,
                    }, traceId).catch((err) => {
                        console.error(JSON.stringify({ traceId, event: "workflow_error", error: String(err) }));
                    });
                }
            }
        } catch {
            console.error(JSON.stringify({ traceId, event: "supabase_unavailable" }));
        }

        return NextResponse.json(
            { success: true, message: "¡Listo! Revisa tu bandeja de entrada." },
            { status: 200 },
        );
    } catch (error) {
        console.error(JSON.stringify({ traceId, event: "quiz_processing_error", error: String(error) }));
        return NextResponse.json(
            { error: "Ocurrió un error inesperado." },
            { status: 500 },
        );
    }
}
