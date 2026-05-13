"use client";

import { useState, useRef, useCallback } from "react";
import { validateField, type LeadFormData } from "@/lib/validations";
import {
    GOAL_OPTIONS,
    RISK_PROFILE_OPTIONS,
    EXPERIENCE_OPTIONS,
} from "../../config/form-options";
import SuccessMessage from "./SuccessMessage";

type FieldErrors = Partial<Record<keyof LeadFormData, string | null>>;

export default function LeadForm() {
    const [formData, setFormData] = useState<LeadFormData>({
        name: "",
        email: "",
        goal: "" as LeadFormData["goal"],
        risk_profile: "" as LeadFormData["risk_profile"],
        experience: "" as LeadFormData["experience"],
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState<string | null>(null);
    const lastSubmitRef = useRef<number>(0);
    const honeypotRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
        (field: keyof LeadFormData, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: null }));
            }
        },
        [errors]
    );

    const validateOnChange = useCallback(
        (field: keyof LeadFormData, value: string) => {
            if (!value) return;
            const error = validateField(field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        },
        []
    );

    const handleBlur = useCallback((field: keyof LeadFormData, value: string) => {
        if (!value) return; // No validar campos vacíos on-blur (solo on-submit)
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const validateAll = (): boolean => {
        const newErrors: FieldErrors = {};
        let valid = true;

        (Object.keys(formData) as (keyof LeadFormData)[]).forEach((field) => {
            const value = formData[field];
            if (!value) {
                newErrors[field] = "Este campo es obligatorio";
                valid = false;
            } else {
                const error = validateField(field, value);
                if (error) {
                    newErrors[field] = error;
                    valid = false;
                }
            }
        });

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        // Honeypot check (bots rellenan campos ocultos)
        if (honeypotRef.current?.value) return;

        // Debounce de 3 segundos
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
            } else if (res.status === 409) {
                setServerError("Ya recibimos tu formulario. Diego te contactará pronto.");
                setStatus("error");
            } else if (res.status === 429) {
                setServerError("Demasiados intentos. Por favor, espera unos minutos.");
                setStatus("error");
            } else {
                setServerError("Hubo un problema al enviar. Por favor, inténtalo en unos minutos.");
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
            <div className="glass-card">
                <SuccessMessage />
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: "2rem" }}>
            {/* Card header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div
                    className="flex items-center gap-2"
                    style={{ marginBottom: "0.5rem" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20V10" />
                        <path d="M18 20V4" />
                        <path d="M6 20v-4" />
                    </svg>
                    <span
                        style={{
                            color: "#00A8E8",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Evaluación Gratuita
                    </span>
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                    ¿Cuál es tu perfil financiero?
                </h2>
            </div>

            {/* Server error banner */}
            {serverError && (
                <div
                    role="alert"
                    aria-live="assertive"
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        color: "#EF4444",
                        fontSize: "0.875rem",
                    }}
                >
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot — invisible para usuarios reales */}
                <div className="hp-field" aria-hidden="true">
                    <label htmlFor="hp-website">Website</label>
                    <input
                        id="hp-website"
                        ref={honeypotRef}
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </div>

                {/* Nombre */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        htmlFor="lead-name"
                        style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "0.375rem", fontWeight: 500 }}
                    >
                        Nombre completo
                    </label>
                    <input
                        id="lead-name"
                        type="text"
                        className={`form-input ${errors.name ? "error" : ""}`}
                        placeholder="Ej: Carlos Rivera"
                        value={formData.name}
                        onChange={(e) => {
                            handleChange("name", e.target.value);
                            validateOnChange("name", e.target.value);
                        }}
                        onBlur={(e) => handleBlur("name", e.target.value)}
                        disabled={status === "loading"}
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "lead-name-error" : undefined}
                    />
                    <div id="lead-name-error" className="field-error" role="alert" aria-live="polite">
                        {errors.name || ""}
                    </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        htmlFor="lead-email"
                        style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "0.375rem", fontWeight: 500 }}
                    >
                        Correo electrónico
                    </label>
                    <input
                        id="lead-email"
                        type="email"
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="tu@correo.com"
                        value={formData.email}
                        onChange={(e) => {
                            handleChange("email", e.target.value);
                            validateOnChange("email", e.target.value);
                        }}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        disabled={status === "loading"}
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "lead-email-error" : undefined}
                    />
                    <div id="lead-email-error" className="field-error" role="alert" aria-live="polite">
                        {errors.email || ""}
                    </div>
                </div>

                {/* Meta financiera */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        htmlFor="lead-goal"
                        style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "0.375rem", fontWeight: 500 }}
                    >
                        ¿Cuál es tu meta financiera principal?
                    </label>
                    <select
                        id="lead-goal"
                        className={`form-input ${errors.goal ? "error" : ""}`}
                        value={formData.goal}
                        onChange={(e) => {
                            handleChange("goal", e.target.value);
                            validateOnChange("goal", e.target.value);
                        }}
                        onBlur={(e) => handleBlur("goal", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.goal}
                        aria-describedby={errors.goal ? "lead-goal-error" : undefined}
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        {GOAL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div id="lead-goal-error" className="field-error" role="alert" aria-live="polite">
                        {errors.goal || ""}
                    </div>
                </div>

                {/* Perfil de riesgo */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        htmlFor="lead-risk"
                        style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "0.375rem", fontWeight: 500 }}
                    >
                        Si tu inversión cae 10%, ¿qué haces?
                    </label>
                    <select
                        id="lead-risk"
                        className={`form-input ${errors.risk_profile ? "error" : ""}`}
                        value={formData.risk_profile}
                        onChange={(e) => {
                            handleChange("risk_profile", e.target.value);
                            validateOnChange("risk_profile", e.target.value);
                        }}
                        onBlur={(e) => handleBlur("risk_profile", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.risk_profile}
                        aria-describedby={errors.risk_profile ? "lead-risk-error" : undefined}
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        {RISK_PROFILE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div id="lead-risk-error" className="field-error" role="alert" aria-live="polite">
                        {errors.risk_profile || ""}
                    </div>
                </div>

                {/* Experiencia */}
                <div style={{ marginBottom: "1.25rem" }}>
                    <label
                        htmlFor="lead-exp"
                        style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "0.375rem", fontWeight: 500 }}
                    >
                        ¿Has invertido antes?
                    </label>
                    <select
                        id="lead-exp"
                        className={`form-input ${errors.experience ? "error" : ""}`}
                        value={formData.experience}
                        onChange={(e) => {
                            handleChange("experience", e.target.value);
                            validateOnChange("experience", e.target.value);
                        }}
                        onBlur={(e) => handleBlur("experience", e.target.value)}
                        disabled={status === "loading"}
                        aria-invalid={!!errors.experience}
                        aria-describedby={errors.experience ? "lead-exp-error" : undefined}
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div id="lead-exp-error" className="field-error" role="alert" aria-live="polite">
                        {errors.experience || ""}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-cta"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="spinner" />
                            Enviando...
                        </span>
                    ) : (
                        "Quiero mi evaluación gratuita →"
                    )}
                </button>

                {/* Privacy notice */}
                <p
                    style={{
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        textAlign: "center",
                        lineHeight: 1.5,
                    }}
                >
                    🔒 Tus datos están 100 % seguros. Solo los usaremos para contactarte.
                </p>
            </form>
        </div>
    );
}
