// Wrapper de Amplitude con lazy loading y graceful degradation
// No contiene PII en los eventos enviados

let amplitudeLoaded = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let amplitudeInstance: any = null;

async function ensureAmplitude() {
    if (amplitudeLoaded) return amplitudeInstance;

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) return null;

    try {
        // Paquete opcional; falla silenciosamente si no está instalado
        const amp = await import("@amplitude/analytics-browser");
        amp.init(apiKey, undefined, {
            defaultTracking: false,
        });
        amplitudeInstance = amp;
        amplitudeLoaded = true;
        return amp;
    } catch {
        // Fallo silencioso si hay ad-blocker, paquete no disponible, u otro error
        amplitudeLoaded = true;
        return null;
    }
}

export async function trackEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean>
) {
    try {
        const amp = await ensureAmplitude();
        if (amp) {
            amp.track(eventName, properties);
        }
    } catch {
        // Degradación elegante: el tracking falla silenciosamente
    }
}
