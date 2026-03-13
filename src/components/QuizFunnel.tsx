"use client";

import { useState, useEffect, useRef } from "react";

// SVGs inline para evitar dependencia de lucide-react
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

const CheckSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CheckBig = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

type Answers = {
    mercados: string[];
    tipoTrader: string;
    frecuencia: string;
    falta: string;
    cambio: string;
    formato: string;
};

const INITIAL_ANSWERS: Answers = {
    mercados: [],
    tipoTrader: "",
    frecuencia: "",
    falta: "",
    cambio: "",
    formato: "",
};

const TOTAL_STEPS = 6;

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function QuizFunnel({ isOpen, onClose }: Props) {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
    const [contact, setContact] = useState({ name: "", email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Paso 7 = análisis (spinner), después de 3s pasa a paso 8 (formulario)
    useEffect(() => {
        if (step === 7) {
            const timer = setTimeout(() => setStep(8), 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Focus trap
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = "hidden";
            
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape" && step !== 7 && !success) {
                    onClose();
                    return;
                }
                
                if (e.key === "Tab" && modalRef.current) {
                    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            
            setTimeout(() => {
                const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                firstFocusable?.focus();
            }, 100);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                document.body.style.overflow = "auto";
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, onClose, step, success]);

    if (!isOpen) return null;

    const handleNext = () => setStep((s) => s + 1);
    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const toggleMercado = (m: string) => {
        setAnswers((prev) => {
            const isSelected = prev.mercados.includes(m);
            return {
                ...prev,
                mercados: isSelected ? prev.mercados.filter((x) => x !== m) : [...prev.mercados, m],
            };
        });
    };

    const selectSingle = (field: keyof Answers, val: string) => {
        setAnswers((prev) => ({ ...prev, [field]: val }));
        setTimeout(handleNext, 400);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contact.name || !contact.email) {
            setErrorMsg("Por favor, llena ambos campos.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            await fetch("/api/quiz-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: contact.name, email: contact.email, answers }),
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setStep(1);
                setAnswers(INITIAL_ANSWERS);
                setContact({ name: "", email: "" });
                setSuccess(false);
                setIsSubmitting(false);
            }, 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No pudimos enviar tus datos.";
            setErrorMsg(message);
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        onClose();
        setStep(1);
        setAnswers(INITIAL_ANSWERS);
        setContact({ name: "", email: "" });
        setSuccess(false);
        setErrorMsg("");
        setIsSubmitting(false);
    };

    const OptionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
        <button
            onClick={onClick}
            style={{
                textAlign: "left",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#D1D5DB",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.9375rem",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                minHeight: "56px",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.background = "rgba(16,185,129,0.08)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "#D1D5DB";
                e.currentTarget.style.transform = "translateX(0)";
            }}
        >
            {label}
        </button>
    );

    return (
        /* Overlay: z-index MUY alto para estar por encima de TODO */
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget && step !== 7 && !success) resetAndClose();
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
            {/* Modal Card */}
            <div
                ref={modalRef}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "520px",
                    background: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.5rem",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(16,185,129,0.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                }}
            >
                {/* Close button */}
                {step !== 7 && !success && (
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
                            transition: "all 0.2s ease",
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.color = "#9CA3AF";
                        }}
                    >
                        <CloseIcon />
                    </button>
                )}

                {/* Progress bar */}
                {step <= TOTAL_STEPS && (
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${(step / TOTAL_STEPS) * 100}%`,
                                background: "linear-gradient(90deg, #10B981, #34D399)",
                                transition: "width 0.4s ease",
                                borderRadius: "0 2px 2px 0",
                            }}
                        />
                    </div>
                )}

                {/* Contenido scrollable */}
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
                    {/* Step header con back + indicador */}
                    {step > 1 && step <= TOTAL_STEPS && (
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
                                {step} / {TOTAL_STEPS}
                            </span>
                        </div>
                    )}
                    {step === 1 && (
                        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>1 / {TOTAL_STEPS}</span>
                        </div>
                    )}

                    {/* ─── PASO 1: Mercados (multi-select) ─── */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                    ¿En qué mercado operas o te interesa operar?
                                </h3>
                                <p style={{ color: "#6B7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                    Puedes seleccionar más de uno.
                                </p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Acciones USA", "Criptomonedas", "Forex", "Futuros", "Materias Primas"].map((m) => {
                                    const active = answers.mercados.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => toggleMercado(m)}
                                            style={{
                                                textAlign: "left",
                                                padding: "1rem 1.25rem",
                                                borderRadius: "1rem",
                                                border: `1px solid ${active ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                                                background: active ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                                                color: active ? "#FFFFFF" : "#D1D5DB",
                                                cursor: "pointer",
                                                fontWeight: 500,
                                                fontSize: "0.9375rem",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                transition: "all 0.2s ease",
                                                fontFamily: "inherit",
                                                minHeight: "56px",
                                            }}
                                        >
                                            <span>{m}</span>
                                            <div
                                                style={{
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "50%",
                                                    border: `2px solid ${active ? "#10B981" : "rgba(255,255,255,0.2)"}`,
                                                    background: active ? "#10B981" : "transparent",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: active ? "#000" : "transparent",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {active && <CheckSmall />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                disabled={answers.mercados.length === 0}
                                onClick={handleNext}
                                style={{
                                    marginTop: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    background: answers.mercados.length > 0 ? "#FFFFFF" : "rgba(255,255,255,0.1)",
                                    color: answers.mercados.length > 0 ? "#000" : "#6B7280",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    padding: "1rem",
                                    borderRadius: "1rem",
                                    border: "none",
                                    cursor: answers.mercados.length > 0 ? "pointer" : "not-allowed",
                                    transition: "all 0.2s ease",
                                    fontFamily: "inherit",
                                }}
                            >
                                Continuar <ChevronRight />
                            </button>
                        </div>
                    )}

                    {/* ─── PASO 2: Tipo Trader ─── */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Qué tipo de trader eres (o quieres ser)?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Scalper", "Intradía", "Swing", "Todavía no lo tengo claro"].map((opt) => (
                                    <OptionButton key={opt} label={opt} onClick={() => selectSingle("tipoTrader", opt)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PASO 3: Frecuencia ─── */}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Con qué frecuencia operas actualmente?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Todos los días", "Varias veces por semana", "Solo cuando veo una oportunidad", "Aún no empiezo"].map((opt) => (
                                    <OptionButton key={opt} label={opt} onClick={() => selectSingle("frecuencia", opt)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PASO 4: Qué falta ─── */}
                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Qué sientes que te está faltando para ser rentable?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Más control emocional", "Una estrategia clara", "Apoyo o guía al operar", "Constancia y disciplina"].map((opt) => (
                                    <OptionButton key={opt} label={opt} onClick={() => selectSingle("falta", opt)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PASO 5: Cambio de vida ─── */}
                    {step === 5 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Qué cambiaría en tu vida si logras la rentabilidad en 60 días?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Dejar mi empleo actual", "Alcanzar libertad financiera", "Más tiempo libre para mí", "Asegurar mi futuro"].map((opt) => (
                                    <OptionButton key={opt} label={opt} onClick={() => selectSingle("cambio", opt)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PASO 6: Formato preferido ─── */}
                    {step === 6 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3, margin: 0 }}>
                                ¿Qué formato te ayudaría más dentro de tu Guía?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {["Ejercicios prácticos", "Ejemplos reales", "Plantillas y checklists", "Tips de psicología"].map((opt) => (
                                    <OptionButton key={opt} label={opt} onClick={() => {
                                        setAnswers((prev) => ({ ...prev, formato: opt }));
                                        handleNext();
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── PASO 7: Spinner de análisis ─── */}
                    {step === 7 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 0", gap: "1.5rem", textAlign: "center" }}>
                            <Spinner size={48} />
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#FFFFFF", maxWidth: "80%", lineHeight: 1.5 }}>
                                Analizando tu perfil de trader y generando tu guía de Velas Japonesas...
                            </h3>
                        </div>
                    )}

                    {/* ─── PASO 8: Formulario de contacto ─── */}
                    {step === 8 && !success && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                                    ¡Tu diagnóstico y tu Guía están listos!
                                </h3>
                                <p style={{ color: "#9CA3AF", fontSize: "0.9375rem" }}>
                                    ¿A qué correo te enviamos el PDF y tus resultados?
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <input
                                    type="text"
                                    placeholder="Tu Nombre"
                                    required
                                    value={contact.name}
                                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "0.75rem",
                                        padding: "1rem 1.25rem",
                                        color: "#FFFFFF",
                                        fontSize: "0.9375rem",
                                        outline: "none",
                                        fontFamily: "inherit",
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#10B981")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />
                                <input
                                    type="email"
                                    placeholder="Correo Electrónico"
                                    required
                                    value={contact.email}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "0.75rem",
                                        padding: "1rem 1.25rem",
                                        color: "#FFFFFF",
                                        fontSize: "0.9375rem",
                                        outline: "none",
                                        fontFamily: "inherit",
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#10B981")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />

                                {errorMsg && (
                                    <p style={{ color: "#EF4444", fontSize: "0.8125rem", textAlign: "center", margin: 0 }}>
                                        {errorMsg}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        marginTop: "0.5rem",
                                        width: "100%",
                                        background: isSubmitting ? "rgba(16,185,129,0.5)" : "linear-gradient(135deg, #10B981, #34D399)",
                                        color: "#000",
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        padding: "1rem",
                                        borderRadius: "0.75rem",
                                        border: "none",
                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                        boxShadow: "0 4px 20px rgba(16,185,129,0.2)",
                                        transition: "all 0.2s ease",
                                        fontFamily: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    {isSubmitting ? <Spinner size={20} /> : "Enviar Guía Gratis"}
                                </button>
                                <p style={{ fontSize: "0.75rem", color: "#4B5563", textAlign: "center", marginTop: "0.25rem" }}>
                                    Tus datos están seguros. No enviamos spam.
                                </p>
                            </form>
                        </div>
                    )}

                    {/* ─── Estado de éxito ─── */}
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
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF" }}>¡Guía enviada!</h3>
                            <p style={{ color: "#9CA3AF" }}>Revisa tu correo. ¡Éxito en tu trading!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
