// Opciones centralizadas del formulario de captación cripto.
// Modificar aquí actualiza automáticamente frontend y validación server-side.

export const COUNTRY_OPTIONS = [
    { value: "PE", label: "Perú" },
    { value: "MX", label: "México" },
    { value: "CO", label: "Colombia" },
    { value: "AR", label: "Argentina" },
    { value: "CL", label: "Chile" },
    { value: "EC", label: "Ecuador" },
    { value: "BO", label: "Bolivia" },
    { value: "UY", label: "Uruguay" },
    { value: "VE", label: "Venezuela" },
    { value: "ES", label: "España" },
    { value: "US", label: "Estados Unidos" },
    { value: "OTHER", label: "Otro" },
] as const;

export const CRYPTO_EXPERIENCE_OPTIONS = [
    { value: "ninguna", label: "Nunca he operado cripto" },
    { value: "basica", label: "He comprado/vendido pero sin estrategia" },
    { value: "intermedia", label: "Opero con cierta regularidad" },
] as const;

export const LEARNING_INTEREST_OPTIONS = [
    { value: "fundamentos", label: "Fundamentos: cómo empezar de forma segura" },
    { value: "spot", label: "Compra/venta spot (largo plazo)" },
    { value: "futuros", label: "Futuros y apalancamiento (con gestión de riesgo)" },
    { value: "analisis", label: "Análisis técnico básico" },
] as const;

// Valores válidos (derivados, para Zod y server-side)
export const VALID_COUNTRIES = COUNTRY_OPTIONS.map((o) => o.value);
export const VALID_CRYPTO_EXPERIENCES = CRYPTO_EXPERIENCE_OPTIONS.map((o) => o.value);
export const VALID_LEARNING_INTERESTS = LEARNING_INTEREST_OPTIONS.map((o) => o.value);

// Labels legibles por valor (para emails y notas en HubSpot)
export const COUNTRY_LABELS: Record<string, string> = Object.fromEntries(
    COUNTRY_OPTIONS.map((o) => [o.value, o.label])
);
export const CRYPTO_EXPERIENCE_LABELS: Record<string, string> = Object.fromEntries(
    CRYPTO_EXPERIENCE_OPTIONS.map((o) => [o.value, o.label])
);
export const LEARNING_INTEREST_LABELS: Record<string, string> = Object.fromEntries(
    LEARNING_INTEREST_OPTIONS.map((o) => [o.value, o.label])
);

// Constantes server-side para HubSpot (no se exponen al cliente como inputs)
export const LEAD_SOURCE = "Landing Cripto Bitunix";
export const LEAD_FUNNEL_STAGE = "Lead nuevo - Guía cripto solicitada";
