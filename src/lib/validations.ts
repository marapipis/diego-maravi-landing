import { z } from "zod";

export const leadSchema = z.object({
    name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede superar los 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras y espacios"),
    email: z
        .string()
        .email("Ingresa un correo electrónico válido")
        .max(255),
    goal: z.enum(["jubilacion", "pasivos", "ahorro", "libertad"], {
        errorMap: () => ({ message: "Selecciona tu meta financiera" }),
    }),
    risk_profile: z.enum(["conservador", "moderado", "agresivo"], {
        errorMap: () => ({ message: "Selecciona tu perfil de riesgo" }),
    }),
    experience: z.enum(["nada", "poco", "mucho"], {
        errorMap: () => ({ message: "Selecciona tu nivel de experiencia" }),
    }),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Validación individual de un campo (para on-blur)
export function validateField(
    field: keyof LeadFormData,
    value: string
): string | null {
    const partialSchema = leadSchema.shape[field];
    const result = partialSchema.safeParse(value);
    if (!result.success) {
        return result.error.errors[0]?.message ?? "Campo inválido";
    }
    return null;
}
