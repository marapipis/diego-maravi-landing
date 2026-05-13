import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../supabase";
import { syncLeadToHubspot } from "../hubspot";
import { sendLeadEmails } from "../email-workflows";

export interface LeadWorkflowData {
    fullName: string;
    email: string;
    emailHash: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
    acceptedRiskDisclaimer: boolean;
    source: string;
}

interface QuizLeadWorkflowData {
    name: string;
    email: string;
    emailHash: string;
    answers?: Record<string, unknown>;
}

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
        console.error(`[workflow] Error logging ${eventType}:`, err);
    }
}

/**
 * Full lead processing workflow (runs after HTTP response is sent).
 * Steps: HubSpot sync → emails → complete.
 */
export async function processLeadWorkflow(
    leadId: string,
    data: LeadWorkflowData,
    traceId: string,
): Promise<void> {
    let supabase: SupabaseClient;
    try {
        supabase = getSupabaseClient();
    } catch {
        console.error(JSON.stringify({ traceId, event: "workflow_supabase_unavailable" }));
        return;
    }

    await logWorkflowEvent(supabase, leadId, "workflow_started", "started");

    // Step 1: Sync to HubSpot (already done synchronously in API route, but re-runs as backup)
    try {
        await logWorkflowEvent(supabase, leadId, "hubspot_sync", "started");

        const hubspotResult = await syncLeadToHubspot(supabase, leadId, {
            fullName: data.fullName,
            email: data.email,
            whatsapp: data.whatsapp,
            country: data.country,
            cryptoExperience: data.cryptoExperience,
            learningInterest: data.learningInterest,
            acceptedRiskDisclaimer: data.acceptedRiskDisclaimer,
            source: data.source,
        });

        await logWorkflowEvent(
            supabase,
            leadId,
            "hubspot_sync",
            hubspotResult.success ? "success" : "error",
            { contactId: hubspotResult.contactId, error: hubspotResult.error }
        );

        console.log(JSON.stringify({
            traceId,
            event: "hubspot_sync",
            success: hubspotResult.success,
            contactId: hubspotResult.contactId,
        }));
    } catch (err) {
        await logWorkflowEvent(supabase, leadId, "hubspot_sync", "error", { error: String(err) });
        console.error(JSON.stringify({ traceId, event: "hubspot_sync_error", error: String(err) }));
    }

    // Step 2: Send emails (confirmation + coach notification)
    try {
        await logWorkflowEvent(supabase, leadId, "send_emails", "started");

        await sendLeadEmails(supabase, leadId, data.emailHash, {
            fullName: data.fullName,
            email: data.email,
            whatsapp: data.whatsapp,
            country: data.country,
            cryptoExperience: data.cryptoExperience,
            learningInterest: data.learningInterest,
        });

        await logWorkflowEvent(supabase, leadId, "send_emails", "success");
    } catch (err) {
        await logWorkflowEvent(supabase, leadId, "send_emails", "error", { error: String(err) });
        console.error(JSON.stringify({ traceId, event: "email_workflow_error", error: String(err) }));
    }

    await logWorkflowEvent(supabase, leadId, "workflow_complete", "success");
}

/**
 * Quiz lead processing workflow.
 */
export async function processQuizLeadWorkflow(
    leadId: string,
    data: QuizLeadWorkflowData,
    traceId: string,
): Promise<void> {
    let supabase: SupabaseClient;
    try {
        supabase = getSupabaseClient();
    } catch {
        console.error(JSON.stringify({ traceId, event: "workflow_supabase_unavailable" }));
        return;
    }

    await logWorkflowEvent(supabase, leadId, "workflow_started", "started");
    // El quiz funnel cripto comparte API con /api/leads ahora; este flujo se conserva
    // sólo para registros legacy de quiz_leads que aún no se hayan procesado.
    await logWorkflowEvent(supabase, leadId, "workflow_complete", "success");
}
