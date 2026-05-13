import {
    COUNTRY_LABELS,
    CRYPTO_EXPERIENCE_LABELS,
    LEARNING_INTEREST_LABELS,
} from "../../config/form-options";

interface LeadData {
    fullName: string;
    email: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
}

// Link al PDF de la guía (placeholder hasta tener la URL final).
const GUIDE_PDF_URL = process.env.NEXT_PUBLIC_GUIDE_PDF_URL || "#";

// Notificación al coach: nuevo lead registrado.
export async function sendCoachNotification(
    lead: LeadData
): Promise<{ success: boolean; providerId?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const coachEmail = process.env.COACH_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || "noreply@diegomaravi.com";

    if (!apiKey || !coachEmail) {
        console.error("[email] Faltan RESEND_API_KEY o COACH_EMAIL");
        return { success: false };
    }

    const formattedDate = new Date().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Lima",
    });

    const countryLabel = COUNTRY_LABELS[lead.country] || lead.country;
    const expLabel = CRYPTO_EXPERIENCE_LABELS[lead.cryptoExperience] || lead.cryptoExperience;
    const interestLabel = LEARNING_INTEREST_LABELS[lead.learningInterest] || lead.learningInterest;

    const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0E1A; color: #FFFFFF; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #10B981; margin-bottom: 1.5rem;">Nuevo lead — Guía Cripto</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Nombre</td><td style="padding: 0.5rem 0; font-weight: 600;">${lead.fullName}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${lead.email}" style="color: #10B981;">${lead.email}</a></td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">WhatsApp</td><td style="padding: 0.5rem 0;">${lead.whatsapp}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">País</td><td style="padding: 0.5rem 0;">${countryLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Experiencia cripto</td><td style="padding: 0.5rem 0;">${expLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Quiere aprender</td><td style="padding: 0.5rem 0;">${interestLabel}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9CA3AF;">Fecha</td><td style="padding: 0.5rem 0;">${formattedDate}</td></tr>
      </table>
      <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #9CA3AF; font-size: 0.875rem;">Fuente: Landing Cripto Bitunix. Etapa: Lead nuevo - Guía cripto solicitada.</p>
    </div>
  `;

    return sendEmailWithRetry({
        apiKey,
        from: fromEmail,
        to: coachEmail,
        subject: `Nuevo lead cripto: ${lead.fullName} (${countryLabel})`,
        html: htmlBody,
    });
}

// Confirmación al lead: entrega la guía gratuita.
export async function sendLeadConfirmation(
    lead: LeadData
): Promise<{ success: boolean; providerId?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "noreply@diegomaravi.com";

    if (!apiKey) {
        console.error("[email] Falta RESEND_API_KEY");
        return { success: false };
    }

    const ctaHtml = GUIDE_PDF_URL !== "#"
        ? `<p style="margin: 1.5rem 0;"><a href="${GUIDE_PDF_URL}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #34D399); color: #0A0E1A; font-weight: 700; padding: 0.875rem 1.75rem; border-radius: 0.75rem; text-decoration: none;">Descargar la guía</a></p>`
        : `<p style="color: #9CA3AF; font-size: 0.9375rem;">Te enviaré la guía en cuanto esté lista (en las próximas horas). Mientras tanto, revisa tu bandeja de entrada y la carpeta de promociones.</p>`;

    const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0E1A; color: #FFFFFF; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #10B981; margin-top: 0;">¡Hola ${lead.fullName.split(" ")[0]}!</h2>
      <p style="line-height: 1.6;">Gracias por registrarte. Tu interés en aprender cripto <strong>de forma responsable</strong> es el primer paso correcto.</p>
      ${ctaHtml}
      <h3 style="color: #FFFFFF; margin-top: 1.75rem; font-size: 1.05rem;">Qué viene ahora</h3>
      <ul style="list-style: none; padding: 0; color: #D1D5DB; line-height: 1.7;">
        <li>1. Lee la guía con calma. No tienes que aplicarlo todo de golpe.</li>
        <li>2. Recibirás contenido educativo adicional en los próximos días.</li>
        <li>3. Si tienes dudas, responde a este correo — lo leo personalmente.</li>
      </ul>
      <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0;" />
      <p style="color: #6B7280; font-size: 0.8125rem; line-height: 1.6;">
        <strong>Aviso:</strong> El contenido es exclusivamente educativo. No constituye asesoría financiera ni promesa de rentabilidad.
        Invertir en cripto implica riesgos. Nunca operes con dinero que no puedas permitirte perder.
      </p>
    </div>
  `;

    return sendEmailWithRetry({
        apiKey,
        from: fromEmail,
        to: lead.email,
        subject: "Tu guía cripto está en camino",
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

            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                const errorText = await res.text().catch(() => "");
                console.error(`[email] Error ${res.status}: ${errorText}`);
                return { success: false };
            }
        } catch (err) {
            console.error(`[email] Intento ${attempt}/${maxRetries} falló:`, err);
        }

        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 500;
            await new Promise((r) => setTimeout(r, delay));
        }
    }

    return { success: false };
}
