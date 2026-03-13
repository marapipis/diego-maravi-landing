import {
    GOAL_LABELS,
    RISK_LABELS,
    EXPERIENCE_LABELS,
} from "../../config/form-options";

interface LeadData {
    name: string;
    email: string;
    goal: string;
    risk_profile: string;
    experience: string;
}

// Envía la notificación al coach sobre un nuevo lead
export async function sendCoachNotification(lead: LeadData): Promise<{ success: boolean; providerId?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const coachEmail = process.env.COACH_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || "noreply@diegomaravi.com";

    if (!apiKey || !coachEmail) {
        console.error("[email] Faltan RESEND_API_KEY o COACH_EMAIL");
        return { success: false };
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Lima",
    });

    const goalLabel = GOAL_LABELS[lead.goal] || lead.goal;
    const riskLabel = RISK_LABELS[lead.risk_profile] || lead.risk_profile;
    const expLabel = EXPERIENCE_LABELS[lead.experience] || lead.experience;

    const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B1120; color: #FFFFFF; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #00A8E8; margin-bottom: 1.5rem;">🎯 Nuevo Lead Recibido</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Nombre</td><td style="padding: 0.5rem 0; font-weight: 600;">${lead.name}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${lead.email}" style="color: #00A8E8;">${lead.email}</a></td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Meta financiera</td><td style="padding: 0.5rem 0;">${goalLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Perfil de riesgo</td><td style="padding: 0.5rem 0;">${riskLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Experiencia</td><td style="padding: 0.5rem 0;">${expLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Fecha</td><td style="padding: 0.5rem 0;">${formattedDate}</td></tr>
      </table>
      <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #9CA3AF; font-size: 0.875rem;">Respóndele lo antes posible para maximizar la conversión.</p>
    </div>
  `;

    return sendEmailWithRetry({
        apiKey,
        from: fromEmail,
        to: coachEmail,
        subject: `Nuevo lead: ${lead.name} — ${goalLabel}`,
        html: htmlBody,
    });
}

// Envía la confirmación al prospecto
export async function sendLeadConfirmation(lead: LeadData): Promise<{ success: boolean; providerId?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "noreply@diegomaravi.com";

    if (!apiKey) {
        console.error("[email] Falta RESEND_API_KEY");
        return { success: false };
    }

    const goalLabel = GOAL_LABELS[lead.goal] || lead.goal;
    const riskLabel = RISK_LABELS[lead.risk_profile] || lead.risk_profile;
    const expLabel = EXPERIENCE_LABELS[lead.experience] || lead.experience;

    const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B1120; color: #FFFFFF; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #00A8E8;">¡Hola ${lead.name}! 👋</h2>
      <p>Recibimos tu evaluación financiera. Aquí un resumen de lo que nos compartiste:</p>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 0.4rem 0;">✅ <strong>Meta:</strong> ${goalLabel}</li>
        <li style="padding: 0.4rem 0;">✅ <strong>Perfil:</strong> ${riskLabel}</li>
        <li style="padding: 0.4rem 0;">✅ <strong>Experiencia:</strong> ${expLabel}</li>
      </ul>
      <p style="margin-top: 1.5rem;">Diego revisará tu perfil y te contactará en las próximas <strong>24 horas</strong> para agendar tu primera sesión gratuita.</p>
      <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #9CA3AF; font-size: 0.875rem;">¿Preguntas? Encuéntranos en Instagram y LinkedIn.</p>
    </div>
  `;

    return sendEmailWithRetry({
        apiKey,
        from: fromEmail,
        to: lead.email,
        subject: "Recibimos tu evaluación — Diego Maravi te contactará pronto",
        html: htmlBody,
    });
}

// Retry con backoff exponencial (máx 3 intentos)
interface EmailPayload {
    apiKey: string;
    from: string;
    to: string;
    subject: string;
    html: string;
}

async function sendEmailWithRetry(
    payload: EmailPayload,
    maxRetries = 3
): Promise<{ success: boolean; providerId?: string }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${payload.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: payload.from,
                    to: payload.to,
                    subject: payload.subject,
                    html: payload.html,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, providerId: data.id };
            }

            // No reintentar errores 4xx (excepto 429)
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                const errorText = await res.text().catch(() => "");
                console.error(`[email] Error ${res.status}: ${errorText}`);
                return { success: false };
            }
        } catch (err) {
            console.error(`[email] Intento ${attempt}/${maxRetries} falló:`, err);
        }

        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
            await new Promise((r) => setTimeout(r, delay));
        }
    }

    return { success: false };
}
