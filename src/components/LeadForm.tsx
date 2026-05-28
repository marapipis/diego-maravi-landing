"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateField } from "@/lib/validations";

type SimpleField = "fullName" | "email" | "whatsapp";
type SimpleFormState = Record<SimpleField, string>;
type FieldErrors = Partial<Record<SimpleField, string | null>>;

const initialState: SimpleFormState = {
    fullName: "",
    email: "",
    whatsapp: "",
};

// Defaults seguros para los campos que ya no se piden en el formulario,
// pero que el endpoint y el schema Zod siguen esperando.
const HIDDEN_DEFAULTS = {
    country: "OTHER",
    cryptoExperience: "ninguna",
    learningInterest: "fundamentos",
    acceptedRiskDisclaimer: true,
} as const;

interface LeadFormProps {
    formId?: string;
    compact?: boolean;
}

export default function LeadForm({ formId = "lead-form", compact = false }: LeadFormProps) {
    const [formData, setFormData] = useState<SimpleFormState>(initialState);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState<string | null>(null);
    const lastSubmitRef = useRef<number>(0);
    const honeypotRef = useRef<HTMLInputElement>(null);
    const utmRef = useRef<Record<string, string>>({});
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        const captured: Record<string, string> = {};
        for (const key of utmKeys) {
            const val = params.get(key);
            if (val) captured[key] = val.slice(0, 200);
        }
        utmRef.current = captured;
    }, []);

    const handleChange = useCallback((field: SimpleField, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
    }, []);

    const handleBlur = useCallback((field: SimpleField, value: string) => {
        if (!value) return;
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const validateAll = (): boolean => {
        const newErrors: FieldErrors = {};
        let valid = true;

        (Object.keys(formData) as SimpleField[]).forEach((field) => {
            const value = formData[field];
            if (!value.trim()) {
                newErrors[field] = "Este campo es obligatorio";
                valid = false;
                return;
            }
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                valid = false;
            }
        });

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (honeypotRef.current?.value) return;

        const now = Date.now();
        if (now - lastSubmitRef.current < 3000) return;
        lastSubmitRef.current = now;

        if (!validateAll()) return;

        setStatus("loading");

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ...HIDDEN_DEFAULTS,
                    ...utmRef.current,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (res.ok) {
                router.push("/gracias");
            } else if (res.status === 429) {
                setServerError("Demasiados intentos. Espera unos minutos.");
                setStatus("error");
            } else if (res.status === 400) {
                const json = await res.json().catch(() => ({}));
                if (json?.fields?.length) {
                    const fe: FieldErrors = {};
                    for (const f of json.fields) {
                        const field = f.field as string;
                        if (field === "fullName" || field === "email" || field === "whatsapp") {
                            fe[field] = f.message;
                        }
                    }
                    setErrors(fe);
                    setServerError("Revisa los campos marcados.");
                } else {
                    setServerError("Datos inválidos. Revisa el formulario.");
                }
                setStatus("error");
            } else {
                setServerError(
                    "Hubo un problema al enviar tu registro. Inténtalo nuevamente en unos segundos."
                );
                setStatus("error");
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
                setServerError("La conexión tardó demasiado. Inténtalo de nuevo.");
            } else {
                setServerError("Error de red. Verifica tu conexión e inténtalo de nuevo.");
            }
            setStatus("error");
        }
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.8125rem",
        color: "#9CA3AF",
        marginBottom: "0.375rem",
        fontWeight: 500,
    };

    return (
        <div className="glass-card" style={{ padding: compact ? "1.5rem" : "2rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
                <span
                    style={{
                        color: "#10B981",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}
                >
                    Acceso inmediato gratuito
                </span>
                <h2
                    style={{
                        fontSize: "1.35rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: "0.4rem 0 0.4rem 0",
                        lineHeight: 1.25,
                    }}
                >
                    Recibe la guía + checklist
                </h2>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                    Déjame tus datos y te envío el material para empezar con más criterio. También podré
                    contactarte por WhatsApp si quieres resolver dudas sobre tu siguiente paso.
                </p>
            </div>

            {serverError && (
                <div
                    role="alert"
                    aria-live="assertive"
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "10px",
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        color: "#FCA5A5",
                        fontSize: "0.875rem",
                    }}
                >
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot */}
                <div className="hp-field" aria-hidden="true">
                    <label htmlFor={`${formId}-hp-website`}>Website</label>
                    <input
                        id={`${formId}-hp-website`}
                        ref={honeypotRef}
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </div>

                {/* Nombre */}
                <div style={{ marginBottom: "0.875rem" }}>
                    <label htmlFor={`${formId}-fullname`} style={labelStyle}>
                        Nombre completo
                    </label>
                    <input
                        id={`${formId}-fullname`}
                        type="text"
                        className={`form-input ${errors.fullName ? "error" : ""}`}
                        placeholder="Ej: Carlos Rivera"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        onBlur={(e) => handleBlur("fullName", e.target.value)}
                        disabled={status === "loading"}
                        autoComplete="name"
                        aria-invalid={!!errors.fullName}
                    />
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.fullName || ""}
                    </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: "0.875rem" }}>
                    <label htmlFor={`${formId}-email`} style={labelStyle}>
                        Correo electrónico
                    </label>
                    <input
                        id={`${formId}-email`}
                        type="email"
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="tu@correo.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        disabled={status === "loading"}
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                    />
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.email || ""}
                    </div>
                </div>

                {/* WhatsApp */}
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor={`${formId}-whatsapp`} style={labelStyle}>
                        WhatsApp (con código de país)
                    </label>
                    <input
                        id={`${formId}-whatsapp`}
                        type="tel"
                        inputMode="tel"
                        className={`form-input ${errors.whatsapp ? "error" : ""}`}
                        placeholder="+51 999 888 777"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                        onBlur={(e) => handleBlur("whatsapp", e.target.value)}
                        disabled={status === "loading"}
                        autoComplete="tel"
                        aria-invalid={!!errors.whatsapp}
                    />
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.whatsapp || ""}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-cta"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <span className="spinner" />
                            Enviando tu registro...
                        </span>
                    ) : (
                        "Enviar y recibir la guía"
                    )}
                </button>

                <p
                    style={{
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        textAlign: "center",
                        lineHeight: 1.5,
                    }}
                >
                    Sin spam. Recibirás la guía, checklist y próximos pasos por correo.
                </p>
            </form>
        </div>
    );
}
