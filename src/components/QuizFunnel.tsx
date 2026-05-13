"use client";

import { useState, useEffect, useRef } from "react";
import {
    COUNTRY_OPTIONS,
    CRYPTO_EXPERIENCE_OPTIONS,
    LEARNING_INTEREST_OPTIONS,
} from "../../config/form-options";
import { validateField, type LeadFormState } from "@/lib/validations";

const Spinner = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const CheckBig = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const TOTAL_QUIZ_STEPS = 3; // experiencia + interés + objetivo

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const initialForm: LeadFormState = {
    fullName: "",
    email: "",
    whatsapp: "",
    country: "",
    cryptoExperience: "",
    learningInterest: "",
    acceptedRiskDisclaimer: false,
};

type FieldErrors = Partial<Record<keyof LeadFormState, string | null>>;

const OBJECTIVE_OPTIONS = [
    "Empezar de cero, sin perderme",
    "Entender el mercado antes de invertir",
    "Aprender análisis técnico básico",
    "Operar con mejor gestión de riesgo",
];

export default function QuizFunnel({ isOpen, onClose }: Props) {
    // step: 1..3 quiz, 4 = loading, 5 = formulario contacto
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<LeadFormState>(initialForm);
    const [objective, setObjective] = useState<string>(""); // sólo para contexto del lead, no se envía como prop dedicada
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const modalRef = useRef<HTMLDivElement>(null);
    const honeypotRef = useRef<HTMLInputElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Análisis ficticio en step 4 (UX): 2.5s y avanza al formulario.
    useEffect(() => {
        if (step === 4) {
            const t = setTimeout(() => setStep(5), 2500);
            return () => clearTimeout(t);
        }
    }, [step]);

    useEffect(() => {
        if (!isOpen) return;
        previousFocusRef.current = document.activeElement as HTMLElement;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && step !== 4 && !success && !isSubmitting) {
                onClose();
                return;
            }
            if (e.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        setTimeout(() => {
            const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }, 80);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
            previousFocusRef.current?.focus();
        };
    }, [isOpen, onClose, step, success, isSubmitting]);

    if (!isOpen) return null;

    const resetAndClose = () => {
        onClose();
        setStep(1);
        setForm(initialForm);
        setObjective("");
        setErrors({});
        setSuccess(false);
        setErrorMsg("");
        setIsSubmitting(false);
    };

    const handleNext = () => setStep((s) => s + 1);
    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const selectAndAdvance = (field: keyof LeadFormState, val: string) => {
        setForm((prev) => ({ ...prev, [field]: val }));
        setTimeout(handleNext, 250);
    };

    const validateFormStep = (): boolean => {
        const newErrors: FieldErrors = {};
        let valid = true;
        const required: (keyof LeadFormState)[] = [
            "fullName",
            "email",
            "whatsapp",
            "country",
            "acceptedRiskDisclaimer",
        ];
        for (const f of required) {
            const value = form[f];
            if (f === "acceptedRiskDisclaimer") {
                if (value !== true) {
                    newErrors[f] = "Debes aceptar el aviso de riesgo";
                    valid = false;
                }
                continue;
            }
            if (typeof value === "string" && !value.trim()) {
                newErrors[f] = "Este campo es obligatorio";
                valid = false;
                continue;
            }
            const err = validateField(f, value);
            if (err) {
                newErrors[f] = err;
                valid = false;
            }
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (honeypotRef.current?.value) return;
        if (!validateFormStep()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => resetAndClose(), 3500);
            } else if (res.status === 400) {
                const json = await res.json().catch(() => ({}));
                if (json?.fields?.length) {
                    const fe: FieldErrors = {};
                    for (const f of json.fields) {
                        fe[f.field as keyof LeadFormState] = f.message;
                    }
                    setErrors(fe);
                    setErrorMsg("Revisa los campos marcados.");
                } else {
                    setErrorMsg("Datos inválidos. Revisa el formulario.");
                }
                setIsSubmitting(false);
            } else if (res.status === 429) {
                setErrorMsg("Demasiados intentos. Espera unos minutos.");
                setIsSubmitting(false);
            } else {
                setErrorMsg(
                    "Hubo un problema al enviar tu registro. Inténtalo nuevamente en unos segundos."
                );
                setIsSubmitting(false);
            }
        } catch {
            setErrorMsg("Error de red. Verifica tu conexión e inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    };

    const OptionButton = ({
        label,
        active,
        onClick,
    }: {
        label: string;
        active?: boolean;
        onClick: () => void;
    }) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                textAlign: "left",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: `1px solid ${active ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                background: active ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                color: active ? "#FFFFFF" : "#D1D5DB",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.9375rem",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                minHeight: "56px",
                width: "100%",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.background = "rgba(16,185,129,0.08)";
                e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
                if (active) return;
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "#D1D5DB";
            }}
        >
            {label}
        </button>
    );

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.8125rem",
        color: "#9CA3AF",
        marginBottom: "0.375rem",
        fontWeight: 500,
    };

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget && step !== 4 && !success && !isSubmitting) resetAndClose();
            }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "1rem",
            }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="quiz-title"
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "560px",
                    background: "#0A0E1A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.5rem",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(16,185,129,0.06)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "92vh",
                }}
            >
                {step !== 4 && !success && (
                    <button
                        onClick={resetAndClose}
                        aria-label="Cerrar"
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.05)",
                            border: "none",
                            borderRadius: "50%",
                            color: "#9CA3AF",
                            cursor: "pointer",
                            zIndex: 10,
                        }}
                    >
                        <CloseIcon />
                    </button>
                )}

                {/* Progress bar */}
                {step <= TOTAL_QUIZ_STEPS && (
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${(step / TOTAL_QUIZ_STEPS) * 100}%`,
                                background: "linear-gradient(90deg, #10B981, #34D399)",
                                transition: "width 0.4s ease",
                            }}
                        />
                    </div>
                )}

                <div
                    style={{
                        padding: "2rem",
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minHeight: "380px",
                    }}
                >
                    {/* Header */}
                    {step > 1 && step <= TOTAL_QUIZ_STEPS && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <button
                                onClick={handleBack}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    background: "none",
                                    border: "none",
                                    color: "#9CA3AF",
                                    cursor: "pointer",
                                    fontSize: "0.8125rem",
                                    fontFamily: "inherit",
                                    padding: "0.25rem",
                                }}
                            >
                                <ChevronLeft /> Atrás
                            </button>
                            <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
                                {step} / {TOTAL_QUIZ_STEPS}
                            </span>
                        </div>
                    )}
                    {step === 1 && (
                        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>1 / {TOTAL_QUIZ_STEPS}</span>
                        </div>
                    )}

                    {/* PASO 1: Experiencia cripto */}
                    {step === 1 && (
                        <div className="quiz-step-enter" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 id="quiz-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Cuál es tu experiencia actual con cripto?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {CRYPTO_EXPERIENCE_OPTIONS.map((opt) => (
                                    <OptionButton
                                        key={opt.value}
                                        label={opt.label}
                                        active={form.cryptoExperience === opt.value}
                                        onClick={() => selectAndAdvance("cryptoExperience", opt.value)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Interés */}
                    {step === 2 && (
                        <div className="quiz-step-enter" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Qué te gustaría aprender primero?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {LEARNING_INTEREST_OPTIONS.map((opt) => (
                                    <OptionButton
                                        key={opt.value}
                                        label={opt.label}
                                        active={form.learningInterest === opt.value}
                                        onClick={() => selectAndAdvance("learningInterest", opt.value)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Objetivo */}
                    {step === 3 && (
                        <div className="quiz-step-enter" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Cuál es tu principal objetivo en los próximos 3 meses?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {OBJECTIVE_OPTIONS.map((opt) => (
                                    <OptionButton
                                        key={opt}
                                        label={opt}
                                        active={objective === opt}
                                        onClick={() => {
                                            setObjective(opt);
                                            setTimeout(handleNext, 250);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PASO 4: Loading */}
                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 0", gap: "1.5rem", textAlign: "center" }}>
                            <Spinner size={48} />
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#FFFFFF", maxWidth: "80%", lineHeight: 1.5 }}>
                                Preparando tu guía cripto personalizada...
                            </h3>
                            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", maxWidth: "85%" }}>
                                Adaptaremos el contenido a tu nivel y a lo que más te interesa aprender.
                            </p>
                        </div>
                    )}

                    {/* PASO 5: Formulario contacto */}
                    {step === 5 && !success && (
                        <form onSubmit={handleSubmit} className="quiz-step-enter" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} noValidate>
                            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                                    ¡Tu guía está lista!
                                </h3>
                                <p style={{ color: "#9CA3AF", fontSize: "0.9375rem", margin: 0 }}>
                                    ¿A qué correo y WhatsApp te enviamos los siguientes pasos?
                                </p>
                            </div>

                            <div className="hp-field" aria-hidden="true">
                                <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
                            </div>

                            <div>
                                <label htmlFor="quiz-fullname" style={labelStyle}>Nombre completo</label>
                                <input
                                    id="quiz-fullname"
                                    type="text"
                                    className={`form-input ${errors.fullName ? "error" : ""}`}
                                    placeholder="Tu nombre"
                                    value={form.fullName}
                                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                                    autoComplete="name"
                                />
                                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                            </div>

                            <div>
                                <label htmlFor="quiz-email" style={labelStyle}>Correo electrónico</label>
                                <input
                                    id="quiz-email"
                                    type="email"
                                    className={`form-input ${errors.email ? "error" : ""}`}
                                    placeholder="tu@correo.com"
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    autoComplete="email"
                                />
                                {errors.email && <div className="field-error">{errors.email}</div>}
                            </div>

                            <div>
                                <label htmlFor="quiz-whatsapp" style={labelStyle}>WhatsApp (con código de país)</label>
                                <input
                                    id="quiz-whatsapp"
                                    type="tel"
                                    inputMode="tel"
                                    className={`form-input ${errors.whatsapp ? "error" : ""}`}
                                    placeholder="+51 999 888 777"
                                    value={form.whatsapp}
                                    onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                                    autoComplete="tel"
                                />
                                {errors.whatsapp && <div className="field-error">{errors.whatsapp}</div>}
                            </div>

                            <div>
                                <label htmlFor="quiz-country" style={labelStyle}>País</label>
                                <select
                                    id="quiz-country"
                                    className={`form-input ${errors.country ? "error" : ""}`}
                                    value={form.country}
                                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                                >
                                    <option value="" disabled>Selecciona tu país</option>
                                    {COUNTRY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.country && <div className="field-error">{errors.country}</div>}
                            </div>

                            <label
                                htmlFor="quiz-disclaimer"
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    alignItems: "flex-start",
                                    padding: "0.75rem",
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: "10px",
                                    marginTop: "0.25rem",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    id="quiz-disclaimer"
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={form.acceptedRiskDisclaimer}
                                    onChange={(e) => setForm((p) => ({ ...p, acceptedRiskDisclaimer: e.target.checked }))}
                                />
                                <span style={{ fontSize: "0.8125rem", color: "#D1D5DB", lineHeight: 1.5 }}>
                                    Entiendo que el contenido es educativo y no es asesoría financiera.
                                    Operar en cripto implica riesgos.
                                </span>
                            </label>
                            {errors.acceptedRiskDisclaimer && <div className="field-error">{errors.acceptedRiskDisclaimer}</div>}

                            {errorMsg && (
                                <p style={{ color: "#FCA5A5", fontSize: "0.8125rem", textAlign: "center", margin: 0 }}>
                                    {errorMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-cta"
                                style={{ marginTop: "0.5rem" }}
                            >
                                {isSubmitting ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                        <span className="spinner" />
                                        Enviando tu registro...
                                    </span>
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                        Quiero mi guía gratuita <ChevronRight />
                                    </span>
                                )}
                            </button>
                            <p style={{ fontSize: "0.75rem", color: "#6B7280", textAlign: "center", marginTop: "0.25rem" }}>
                                Después de registrarte, recibirás la guía y los siguientes pasos por correo.
                            </p>
                        </form>
                    )}

                    {/* Success */}
                    {success && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 0", gap: "1rem", textAlign: "center" }}>
                            <div
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    background: "rgba(16,185,129,0.15)",
                                    border: "2px solid rgba(16,185,129,0.4)",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#10B981",
                                }}
                            >
                                <CheckBig />
                            </div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                                Gracias por registrarte.
                            </h3>
                            <p style={{ color: "#D1D5DB", maxWidth: "300px", lineHeight: 1.5 }}>
                                Te enviaré la guía gratuita a tu correo en los próximos minutos.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
