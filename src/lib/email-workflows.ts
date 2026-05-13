import type { SupabaseClient } from "@supabase/supabase-js";
import { sendCoachNotification, sendLeadConfirmation } from "./email";

export interface LeadEmailData {
    fullName: string;
    email: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
}

/**
 * Send confirmation + coach notification emails and log results to email_events.
 * Fire-and-forget: never throws.
 */
export async function sendLeadEmails(
    supabase: SupabaseClient,
    leadId: string,
    emailHash: string,
    leadData: LeadEmailData,
): Promise<void> {
    const results = await Promise.allSettled([
        sendCoachNotification(leadData),
        sendLeadConfirmation(leadData),
    ]);

    const templates = ["coach_notification", "lead_confirmation"] as const;

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const template = templates[i];

        try {
            const success = result.status === "fulfilled" && result.value.success;
            const messageId = result.status === "fulfilled" ? result.value.providerId : undefined;

            await supabase.from("email_events").insert({
                lead_id: leadId,
                email_hash: emailHash,
                template,
                provider: "resend",
                status: success ? "sent" : "failed",
                message_id: messageId || null,
            });
        } catch (logError) {
            console.error(`[email-workflows] Error logging ${template}:`, logError);
        }
    }
}
