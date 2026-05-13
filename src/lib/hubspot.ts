import type { SupabaseClient } from "@supabase/supabase-js";
import {
    COUNTRY_LABELS,
    CRYPTO_EXPERIENCE_LABELS,
    LEARNING_INTEREST_LABELS,
    LEAD_SOURCE,
    LEAD_FUNNEL_STAGE,
} from "../../config/form-options";

export interface HubSpotContactData {
    fullName: string;
    email: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
    acceptedRiskDisclaimer: boolean;
    source?: string;
}

export interface HubSpotResult {
    success: boolean;
    contactId?: string;
    error?: string;
}

function getAccessToken(): string | undefined {
    return process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN;
}

function splitName(fullName: string): { firstname: string; lastname: string } {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstname: parts[0], lastname: "" };
    return {
        firstname: parts[0],
        lastname: parts.slice(1).join(" "),
    };
}

// Solo propiedades 100% estándar en todos los portales HubSpot.
// No incluir propiedades custom ni lead_source (no es estándar).
function buildStandardProperties(data: HubSpotContactData): Record<string, string> {
    const { firstname, lastname } = splitName(data.fullName);
    const countryLabel = COUNTRY_LABELS[data.country] || data.country;

    return {
        email: data.email.toLowerCase().trim(),
        firstname,
        lastname,
        phone: data.whatsapp,
        country: countryLabel,
        lifecyclestage: "lead",
    };
}

// Cuerpo de la nota anexa: toda la info cripto + fuente + fecha.
function buildLeadNoteHtml(data: HubSpotContactData): string {
    const expLabel = CRYPTO_EXPERIENCE_LABELS[data.cryptoExperience] || data.cryptoExperience;
    const interestLabel = LEARNING_INTEREST_LABELS[data.learningInterest] || data.learningInterest;
    const countryLabel = COUNTRY_LABELS[data.country] || data.country;
    const fecha = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });

    return `
<p><strong>Lead nuevo desde landing cripto Bitunix</strong></p>
<ul>
  <li><strong>Fuente:</strong> ${data.source || LEAD_SOURCE}</li>
  <li><strong>Etapa del funnel:</strong> ${LEAD_FUNNEL_STAGE}</li>
  <li><strong>WhatsApp:</strong> ${data.whatsapp}</li>
  <li><strong>País:</strong> ${countryLabel}</li>
  <li><strong>Experiencia con cripto:</strong> ${expLabel}</li>
  <li><strong>Qué quiere aprender primero:</strong> ${interestLabel}</li>
  <li><strong>Aceptó disclaimer de riesgo:</strong> ${data.acceptedRiskDisclaimer ? "Sí" : "No"}</li>
  <li><strong>Fecha de registro:</strong> ${fecha} (hora Lima)</li>
</ul>
`.trim();
}

// --- HubSpot REST helpers ---

async function searchContactByEmail(
    accessToken: string,
    email: string
): Promise<string | null> {
    try {
        const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
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
                        value: email.toLowerCase().trim(),
                    }],
                }],
                limit: 1,
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.results?.[0]?.id ?? null;
    } catch {
        return null;
    }
}

async function patchContact(
    accessToken: string,
    contactId: string,
    properties: Record<string, string>
): Promise<boolean> {
    try {
        const patchProps = { ...properties };
        delete patchProps.email; // email es identity, no se patcha
        const res = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ properties: patchProps }),
            }
        );
        return res.ok;
    } catch {
        return false;
    }
}

// Adjunta una nota al contacto (con los campos custom cripto consolidados).
async function attachNoteToContact(
    accessToken: string,
    contactId: string,
    html: string
): Promise<void> {
    try {
        const res = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                properties: {
                    hs_note_body: html,
                    hs_timestamp: Date.now(),
                },
                associations: [{
                    to: { id: contactId },
                    types: [{
                        associationCategory: "HUBSPOT_DEFINED",
                        associationTypeId: 202, // contact ↔ note
                    }],
                }],
            }),
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => "");
            console.error("[HubSpot] No se pudo adjuntar la nota:", errText);
        }
    } catch (err) {
        console.error("[HubSpot] Error adjuntando nota:", err);
    }
}

// --- Public API ---

/**
 * Crea o actualiza un contacto en HubSpot usando solo propiedades estándar.
 * Adjunta una nota con los campos cripto consolidados.
 */
export async function createOrUpdateHubspotContact(
    data: HubSpotContactData
): Promise<HubSpotResult> {
    const accessToken = getAccessToken();
    if (!accessToken) {
        console.error("[HubSpot] Falta HUBSPOT_PRIVATE_APP_TOKEN");
        return { success: false, error: "HubSpot no configurado" };
    }

    const properties = buildStandardProperties(data);
    let contactId: string | undefined;

    try {
        const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ properties }),
        });

        if (createRes.ok) {
            const result = await createRes.json();
            contactId = result.id;
        } else {
            const errorData = await createRes.json().catch(() => ({}));
            const isConflict =
                errorData?.category === "CONFLICT" ||
                createRes.status === 409 ||
                (typeof errorData?.message === "string" && errorData.message.includes("already exists"));

            if (isConflict) {
                const existingId = await searchContactByEmail(accessToken, data.email);
                if (!existingId) {
                    return { success: false, error: "Conflicto pero no se encontró el contacto" };
                }
                contactId = existingId;
                await patchContact(accessToken, contactId, properties);
            } else {
                console.error("[HubSpot] Error creando contacto:", errorData);
                return {
                    success: false,
                    error: errorData?.message || `HTTP ${createRes.status}`,
                };
            }
        }
    } catch (err) {
        return { success: false, error: String(err) };
    }

    if (!contactId) {
        return { success: false, error: "Sin contactId" };
    }

    // Adjuntar la nota (best-effort, no bloquea el éxito del lead).
    await attachNoteToContact(accessToken, contactId, buildLeadNoteHtml(data));

    return { success: true, contactId };
}

/**
 * Sync completo: crea/actualiza en HubSpot y registra el resultado en contact_sync_log.
 */
export async function syncLeadToHubspot(
    supabase: SupabaseClient,
    leadId: string,
    data: HubSpotContactData
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
