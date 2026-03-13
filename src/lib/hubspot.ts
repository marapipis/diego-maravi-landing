import type { SupabaseClient } from "@supabase/supabase-js";

interface HubSpotContactData {
    name: string;
    email: string;
    goal?: string;
    risk_profile?: string;
    experience?: string;
    source?: string;
}

interface HubSpotResult {
    success: boolean;
    contactId?: string;
    error?: string;
}

function getAccessToken(): string | undefined {
    return process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN;
}

function buildContactProperties(data: HubSpotContactData): Record<string, string> {
    const nameParts = data.name.trim().split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    const properties: Record<string, string> = {
        email: data.email.toLowerCase().trim(),
        firstname,
        lastname,
    };

    if (data.goal) properties.meta_financiera = data.goal;
    if (data.risk_profile) properties.perfil_riesgo = data.risk_profile;
    if (data.experience) properties.experiencia_inversiones = data.experience;
    if (data.source) properties.hs_analytics_source = data.source;

    return properties;
}

// --- Existing functions (preserved for backward compatibility) ---

export async function sendToHubSpot(data: HubSpotContactData): Promise<HubSpotResult> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        console.error("[HubSpot] No se encontró HUBSPOT_ACCESS_TOKEN");
        return { success: false, error: "HubSpot no configurado" };
    }

    try {
        const properties = buildContactProperties(data);

        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ properties }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (errorData.category === "CONFLICT") {
                console.log("[HubSpot] Contacto ya existe, actualizando");
                return updateExistingContact(data);
            }

            console.error("[HubSpot] Error creando contacto:", errorData);
            return { success: false, error: errorData.message || "Error de HubSpot" };
        }

        const result = await response.json();
        console.log("[HubSpot] Contacto creado:", result.id);
        return { success: true, contactId: result.id };
    } catch (error) {
        console.error("[HubSpot] Error de conexión:", error);
        return { success: false, error: String(error) };
    }
}

export async function searchAndUpdateHubSpotContact(data: HubSpotContactData): Promise<HubSpotResult> {
    const accessToken = getAccessToken();

    try {
        const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                filterGroups: [{
                    filters: [{
                        propertyName: "email",
                        operator: "EQ",
                        value: data.email.toLowerCase().trim(),
                    }],
                }],
            }),
        });

        if (!searchResponse.ok) {
            return { success: false, error: "Error buscando contacto" };
        }

        const searchResult = await searchResponse.json();

        if (searchResult.total > 0) {
            const contactId = searchResult.results[0].id;
            console.log("[HubSpot] Contacto existente encontrado:", contactId);
            return { success: true, contactId };
        }

        return { success: false, error: "Contacto no encontrado" };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function sendQuizLeadToHubSpot(data: {
    name: string;
    email: string;
    answers?: Record<string, unknown>;
}): Promise<HubSpotResult> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        console.error("[HubSpot] No se encontró HUBSPOT_ACCESS_TOKEN");
        return { success: false, error: "HubSpot no configurado" };
    }

    try {
        const nameParts = data.name.trim().split(" ");
        const firstname = nameParts[0] || "";
        const lastname = nameParts.slice(1).join(" ") || "";

        const properties: Record<string, string> = {
            email: data.email.toLowerCase().trim(),
            firstname,
            lastname,
            hs_analytics_source: "quiz_funnel",
        };

        if (data.answers) {
            properties.quiz_lead_data = JSON.stringify(data.answers);
        }

        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ properties }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (errorData.category === "CONFLICT") {
                return updateExistingContact({
                    name: data.name,
                    email: data.email,
                    source: "quiz_funnel",
                });
            }

            console.error("[HubSpot] Error creando quiz lead:", errorData);
            return { success: false, error: errorData.message || "Error de HubSpot" };
        }

        const result = await response.json();
        console.log("[HubSpot] Quiz lead creado:", result.id);
        return { success: true, contactId: result.id };
    } catch (error) {
        console.error("[HubSpot] Error de conexión (quiz):", error);
        return { success: false, error: String(error) };
    }
}

// --- New functions ---

/**
 * Create or update a HubSpot contact. Tries POST first; on conflict,
 * searches for the existing contact and PATCHes it with updated properties.
 */
export async function createOrUpdateHubspotContact(data: HubSpotContactData): Promise<HubSpotResult> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return { success: false, error: "HubSpot no configurado" };
    }

    try {
        const properties = buildContactProperties(data);

        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ properties }),
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, contactId: result.id };
        }

        const errorData = await response.json().catch(() => ({}));

        if (errorData.category === "CONFLICT") {
            return updateExistingContact(data);
        }

        return { success: false, error: errorData.message || "Error de HubSpot" };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Full sync: create/update contact in HubSpot and log the result to contact_sync_log.
 */
export async function syncLeadToHubspot(
    supabase: SupabaseClient,
    leadId: string,
    data: HubSpotContactData,
): Promise<HubSpotResult> {
    const result = await createOrUpdateHubspotContact(data);

    try {
        await supabase.from("contact_sync_log").insert({
            lead_id: leadId,
            hubspot_contact_id: result.contactId || null,
            status: result.success ? "success" : "error",
            error_message: result.error || null,
        });
    } catch (logError) {
        console.error("[HubSpot] Error logging sync result:", logError);
    }

    return result;
}

// --- Internal helpers ---

async function updateExistingContact(data: HubSpotContactData): Promise<HubSpotResult> {
    const accessToken = getAccessToken();

    try {
        // First, find the existing contact
        const searchResult = await searchAndUpdateHubSpotContact(data);
        if (!searchResult.success || !searchResult.contactId) {
            return searchResult;
        }

        // Then PATCH it with updated properties
        const properties = buildContactProperties(data);
        delete properties.email; // email is the identity key, not updatable via PATCH

        const patchResponse = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${searchResult.contactId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ properties }),
            },
        );

        if (!patchResponse.ok) {
            const errorData = await patchResponse.json().catch(() => ({}));
            console.error("[HubSpot] Error actualizando contacto:", errorData);
            // Still return success with ID since the contact exists
            return { success: true, contactId: searchResult.contactId };
        }

        console.log("[HubSpot] Contacto actualizado:", searchResult.contactId);
        return { success: true, contactId: searchResult.contactId };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
