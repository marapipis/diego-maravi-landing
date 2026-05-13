import { z } from "zod";
import {
    VALID_COUNTRIES,
    VALID_CRYPTO_EXPERIENCES,
    VALID_LEARNING_INTERESTS,
} from "../../config/form-options";

// Regex WhatsApp internacional: opcional "+", 7-15 dígitos (estándar E.164)
const whatsappRegex = /^\+?[0-9]{7,15}$/;

export const leadSchema = z.object({
    fullName: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(80, "El nombre no puede superar los 80 caracteres")
        .regex(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
            "El nombre solo puede contener letras y espacios"
        ),
    email: z
        .string()
        .email("Ingresa un correo electrónico válido")
        .max(255),
    whatsapp: z
        .string()
        .min(7, "Ingresa un número de WhatsApp válido")
        .max(20, "Número demasiado largo")
        .refine(
            (val) => whatsappRegex.test(val.replace(/\s|-/g, "")),
            "Ingresa solo números (opcionalmente con + al inicio)"
        ),
    country: z.enum(VALID_COUNTRIES as [string, ...string[]], {
        errorMap: () => ({ message: "Selecciona tu país" }),
    }),
    cryptoExperience: z.enum(VALID_CRYPTO_EXPERIENCES as [string, ...string[]], {
        errorMap: () => ({ message: "Selecciona tu experiencia con cripto" }),
    }),
    learningInterest: z.enum(VALID_LEARNING_INTERESTS as [string, ...string[]], {
        errorMap: () => ({ message: "Selecciona qué te interesa aprender" }),
    }),
    acceptedRiskDisclaimer: z.literal(true, {
        errorMap: () => ({
            message: "Debes aceptar el aviso de riesgo para continuar",
        }),
    }),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Tipo del formulario antes de validar (acepta strings vacíos y boolean inicial)
export type LeadFormState = {
    fullName: string;
    email: string;
    whatsapp: string;
    country: string;
    cryptoExperience: string;
    learningInterest: string;
    acceptedRiskDisclaimer: boolean;
};

// Validación individual de un campo (para on-blur)
export function validateField(
    field: keyof LeadFormState,
    value: string | boolean
): string | null {
    const partialSchema = leadSchema.shape[field];
    const result = partialSchema.safeParse(value);
    if (!result.success) {
        return result.error.errors[0]?.message ?? "Campo inválido";
    }
    return null;
}

// Normaliza WhatsApp a formato E.164 sin espacios/guiones
export function normalizeWhatsapp(raw: string): string {
    const cleaned = raw.replace(/\s|-/g, "");
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}
