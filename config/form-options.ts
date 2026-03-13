// Opciones centralizadas para los selects del formulario de leads.
// Modificar aquí actualiza automáticamente tanto el frontend como la validación server-side.

export const GOAL_OPTIONS = [
    { value: "jubilacion", label: "Asegurar mi jubilación" },
    { value: "pasivos", label: "Generar ingresos pasivos" },
    { value: "ahorro", label: "Vencer a la inflación / Ahorrar" },
    { value: "libertad", label: "Alcanzar la libertad financiera temprana" },
] as const;

export const RISK_PROFILE_OPTIONS = [
    { value: "conservador", label: "Me asusto y retiro todo (Perfil Conservador)" },
    { value: "moderado", label: "Espero a que se recupere (Perfil Moderado)" },
    { value: "agresivo", label: "Compro más, está en descuento (Perfil Audaz)" },
] as const;

export const EXPERIENCE_OPTIONS = [
    { value: "nada", label: "No, empiezo desde cero" },
    { value: "poco", label: "He comprado algo de cripto o acciones sueltas" },
    { value: "mucho", label: "Sí, tengo un portafolio activo" },
] as const;

// Valores válidos derivados de las opciones (para Zod y server-side)
export const VALID_GOALS = GOAL_OPTIONS.map((o) => o.value);
export const VALID_RISK_PROFILES = RISK_PROFILE_OPTIONS.map((o) => o.value);
export const VALID_EXPERIENCES = EXPERIENCE_OPTIONS.map((o) => o.value);

// Labels legibles por valor (para emails de notificación)
export const GOAL_LABELS: Record<string, string> = Object.fromEntries(
    GOAL_OPTIONS.map((o) => [o.value, o.label])
);
export const RISK_LABELS: Record<string, string> = Object.fromEntries(
    RISK_PROFILE_OPTIONS.map((o) => [o.value, o.label])
);
export const EXPERIENCE_LABELS: Record<string, string> = Object.fromEntries(
    EXPERIENCE_OPTIONS.map((o) => [o.value, o.label])
);
