"use client";

import { useState, useRef, useCallback } from "react";
import { validateField, type LeadFormState } from "@/lib/validations";
import {
    COUNTRY_OPTIONS,
    CRYPTO_EXPERIENCE_OPTIONS,
    LEARNING_INTEREST_OPTIONS,
} from "../../config/form-options";
import SuccessMessage from "./SuccessMessage";

type FieldErrors = Partial<Record<keyof LeadFormState, string | null>>;

const initialState: LeadFormState = {
    fullName: "",
    email: "",
    whatsapp: "",
    country: "",
    cryptoExperience: "",
    learningInterest: "",
    acceptedRiskDisclaimer: false,
};

interface LeadFormProps {
    formId?: string;
    compact?: boolean;
}

export default function LeadForm({ formId = "lead-form", compact = false }: LeadFormProps) {
    const [formData, setFormData] = useState<LeadFormState>(initialState);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState<string | null>(null);
    const lastSubmitRef = useRef<number>(0);
    const honeypotRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
        (field: keyof LeadFormState, value: string | boolean) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: null }));
        },
        []
    );

    const handleBlur = useCallback((field: keyof LeadFormState, value: string | boolean) => {
        if (typeof value === "string" && !value) return;
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const validateAll = (): boolean => {
        const newErrors: FieldErrors = {};
        let valid = true;

        (Object.keys(formData) as (keyof LeadFormState)[]).forEach((field) => {
            const value = formData[field];
            if (field === "acceptedRiskDisclaimer") {
                if (value !== true) {
                    newErrors[field] = "Debes aceptar el aviso de riesgo para continuar";
                    valid = false;
                }
                return;
            }
            if (typeof value === "string" && !value.trim()) {
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
                body: JSON.stringify(formData),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (res.ok) {
                setStatus("success");
            } else if (res.status === 429) {
                setServerError("Demasiados intentos. Espera unos minutos.");
                setStatus("error");
            } else if (res.status === 400) {
                const json = await res.json().catch(() => ({}));
                if (json?.fields?.length) {
                    const fe: FieldErrors = {};
                    for (const f of json.fields) {
                        fe[f.field as keyof LeadFormState] = f.message;
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

    if (status === "success") {
        return (
            <div className="glass-card" style={{ padding: compact ? "1.5rem" : "2rem" }}>
                <SuccessMessage />
            </div>
        );
    }

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
                    Acceso gratuito
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
                    Solicita tu guía cripto
                </h2>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                    Recibirás contenido educativo gratuito. No compartiremos tu información con
                    terceros sin tu consentimiento.
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
                <div style={{ marginBottom: "0.875rem" }}>
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

                {/* País */}
                <div style={{ marginBottom: "0.875rem" }}>
                    <label htmlFor={`${formId}-country`} style={labelStyle}>
                        País
                    </label>
                    <select
                        id={`${formId}-country`}
                        className={`form-input ${errors.country ? "error" : ""}`}
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        onBlur={(e) => handleBlur("country", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.country}
                    >
                        <option value="" disabled>Selecciona tu país</option>
                        {COUNTRY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.country || ""}
                    </div>
                </div>

                {/* Experiencia cripto */}
                <div style={{ marginBottom: "0.875rem" }}>
                    <label htmlFor={`${formId}-exp`} style={labelStyle}>
                        ¿Cuál es tu experiencia con cripto?
                    </label>
                    <select
                        id={`${formId}-exp`}
                        className={`form-input ${errors.cryptoExperience ? "error" : ""}`}
                        value={formData.cryptoExperience}
                        onChange={(e) => handleChange("cryptoExperience", e.target.value)}
                        onBlur={(e) => handleBlur("cryptoExperience", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.cryptoExperience}
                    >
                        <option value="" disabled>Selecciona una opción</option>
                        {CRYPTO_EXPERIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.cryptoExperience || ""}
                    </div>
                </div>

                {/* Interés de aprendizaje */}
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor={`${formId}-interest`} style={labelStyle}>
                        ¿Qué te gustaría aprender primero?
                    </label>
                    <select
                        id={`${formId}-interest`}
                        className={`form-input ${errors.learningInterest ? "error" : ""}`}
                        value={formData.learningInterest}
                        onChange={(e) => handleChange("learningInterest", e.target.value)}
                        onBlur={(e) => handleBlur("learningInterest", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.learningInterest}
                    >
                        <option value="" disabled>Selecciona una opción</option>
                        {LEARNING_INTEREST_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="field-error" role="alert" aria-live="polite">
                        {errors.learningInterest || ""}
                    </div>
                </div>

                {/* Disclaimer */}
                <label
                    htmlFor={`${formId}-disclaimer`}
                    style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        marginBottom: "1rem",
                        cursor: "pointer",
                    }}
                >
                    <input
                        id={`${formId}-disclaimer`}
                        type="checkbox"
                        className="custom-checkbox"
                        checked={formData.acceptedRiskDisclaimer}
                        onChange={(e) => handleChange("acceptedRiskDisclaimer", e.target.checked)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.acceptedRiskDisclaimer}
                    />
                    <span style={{ fontSize: "0.8125rem", color: "#D1D5DB", lineHeight: 1.5 }}>
                        Entiendo que el contenido es <strong>educativo</strong> y no es asesoría
                        financiera. Operar en cripto implica riesgos y nunca debo invertir dinero
                        que no pueda permitirme perder.
                    </span>
                </label>
                {errors.acceptedRiskDisclaimer && (
                    <div className="field-error" role="alert" aria-live="polite" style={{ marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
                        {errors.acceptedRiskDisclaimer}
                    </div>
                )}

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
                        "Quiero mi guía gratuita"
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
                    Después de registrarte, recibirás la guía y los siguientes pasos por correo.
                </p>
            </form>
        </div>
    );
}
