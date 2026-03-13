import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../supabase";
import { syncLeadToHubspot } from "../hubspot";
import { sendLeadEmails } from "../email-workflows";

interface LeadWorkflowData {
    name: string;
    email: string;
    emailHash: string;
    goal: string;
    risk_profile: string;
    experience: string;
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
 * Each step is independent — failures don't block subsequent steps.
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

    // Step 1: Sync to HubSpot
    try {
        await logWorkflowEvent(supabase, leadId, "hubspot_sync", "started");

        const hubspotResult = await syncLeadToHubspot(supabase, leadId, {
            name: data.name,
            email: data.email,
            goal: data.goal,
            risk_profile: data.risk_profile,
            experience: data.experience,
            source: data.source,
        });

        await logWorkflowEvent(supabase, leadId, "hubspot_sync", hubspotResult.success ? "success" : "error", {
            contactId: hubspotResult.contactId,
            error: hubspotResult.error,
        });

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
            name: data.name,
            email: data.email,
            goal: data.goal,
            risk_profile: data.risk_profile,
            experience: data.experience,
        });

        await logWorkflowEvent(supabase, leadId, "send_emails", "success");
    } catch (err) {
        await logWorkflowEvent(supabase, leadId, "send_emails", "error", { error: String(err) });
        console.error(JSON.stringify({ traceId, event: "email_workflow_error", error: String(err) }));
    }

    // Step 3: Complete
    await logWorkflowEvent(supabase, leadId, "workflow_complete", "success");
}

/**
 * Quiz lead processing workflow (simpler — HubSpot sync only, no emails).
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

    // Step 1: Sync to HubSpot
    try {
        await logWorkflowEvent(supabase, leadId, "hubspot_sync", "started");

        const hubspotResult = await syncLeadToHubspot(supabase, leadId, {
            name: data.name,
            email: data.email,
            source: "quiz_funnel",
        });

        await logWorkflowEvent(supabase, leadId, "hubspot_sync", hubspotResult.success ? "success" : "error", {
            contactId: hubspotResult.contactId,
            error: hubspotResult.error,
        });

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

    // Step 2: Complete
    await logWorkflowEvent(supabase, leadId, "workflow_complete", "success");
}
