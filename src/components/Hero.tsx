"use client";

import { useState } from "react";
import Image from "next/image";
import LeadForm from "./LeadForm";
import QuizFunnel from "./QuizFunnel";

const BENEFITS = [
    "Plan de inversión personalizado a tu perfil de riesgo",
    "Estrategias probadas para hacer crecer tu patrimonio",
    "Acompañamiento 1 a 1 sin jerga financiera intimidante",
];

export default function Hero() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <section id="main-content" className="hero-bg" style={{ position: "relative", overflow: "hidden" }} aria-label="Evaluación financiera gratuita">
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    padding: "4rem 2rem 3rem",
                    minHeight: "calc(100vh - 100px)",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                }}
            >
                {/* ── Imagen del Coach centrada detrás de todo el contenido ── */}
                {/* Se centra respecto al viewport completo del hero */}
                <div
                    className="coach-photo-container"
                    style={{
                        position: "absolute",
                        // ~7.5rem = 4rem padding + ~3.5rem (una línea de h1)
                        // para que el top de la imagen coincida con "patrimonio"
                        top: "7.5rem",
                        bottom: 0,
                        left: isQuizOpen ? "50%" : "51%",
                        transform: "translateX(-50%)",
                        width: "380px",
                        zIndex: 1,
                        pointerEvents: "none",
                        transition: "left 0.4s ease",
                    }}
                >
                    {/* Anillos radiales — centrados en el tercio superior donde está el torso/cara */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        // paddingTop mueve el centro de los anillos hacia la zona del torso del coach
                        paddingTop: "80px",
                        zIndex: 0,
                    }}>
                        <div style={{ position: "relative", width: "0", height: "0" }}>
                            <div style={{ position: "absolute", top: "-210px", left: "-210px", width: "420px", height: "420px", borderRadius: "50%", border: "1px solid rgba(0,168,232,0.08)" }} />
                            <div style={{ position: "absolute", top: "-270px", left: "-270px", width: "540px", height: "540px", borderRadius: "50%", border: "1px solid rgba(0,168,232,0.04)" }} />
                            <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,168,232,0.1) 0%, transparent 70%)" }} />
                        </div>
                    </div>

                    {/* Foto del coach — fondo transparente + glow profesional */}
                    <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 1 }}>
                        <Image
                            src="/coach-diego.png"
                            alt="Diego Maraví — Coach Financiero"
                            fill
                            style={{
                                objectFit: "contain",
                                objectPosition: "top center",
                                filter: [
                                    "drop-shadow(0 0 40px rgba(0,168,232,0.25))",
                                    "drop-shadow(0 0 80px rgba(0,168,232,0.10))",
                                ].join(" "),
                            }}
                            sizes="(max-width: 768px) 0px, 580px"
                            priority
                            quality={85}
                        />
                        {/* Fade solo en la parte inferior para que los pies se integren al fondo */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, var(--brand-dark, #0B1120) 0%, transparent 100%)", zIndex: 2 }} />
                    </div>
                </div>

                {/* ── Grid de contenido: texto izq + formulario der ── */}
                <div
                    className="hero-content-grid"
                    style={{
                        display: "grid",
                        // Cuando el quiz está abierto, el formulario desaparece y el texto ocupa menos espacio
                        gridTemplateColumns: isQuizOpen ? "1fr" : "1fr 420px",
                        gap: "2rem",
                        alignItems: "flex-start",
                        width: "100%",
                        position: "relative",
                        zIndex: 2,
                        transition: "grid-template-columns 0.4s ease",
                    }}
                >
                    {/* Columna izquierda: texto + CTA */}
                    <div style={{
                        position: "relative",
                        zIndex: 3,
                        // Limitar el ancho del texto para que no invada el espacio del coach
                        maxWidth: "46%",
                    }}>
                        <h1
                            style={{
                                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                                fontWeight: 800,
                                lineHeight: 1.05,
                                marginBottom: "1.5rem",
                                color: "#FFFFFF",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Construye tu{" "}
                            <br />
                            patrimonio{" "}
                            <span style={{ color: "#00A8E8" }}>de</span>
                            <br />
                            <span style={{ color: "#00A8E8" }}>inversión</span>
                        </h1>

                        <p
                            style={{
                                fontSize: "1.125rem",
                                color: "#9CA3AF",
                                lineHeight: 1.7,
                                maxWidth: "480px",
                                marginBottom: "2rem",
                                fontWeight: 300,
                            }}
                        >
                            Para no ser esclavo del dinero y disfrutar de tu libertad financiera
                            con un plan diseñado para ti.
                        </p>

                        {/* Benefits */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
                            {BENEFITS.map((benefit) => (
                                <div key={benefit} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                                    <div className="benefit-check">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <span style={{ color: "#D1D5DB", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA: abre el quiz */}
                        <button
                            onClick={() => setIsQuizOpen(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.875rem 1.75rem",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "1rem",
                                color: "#FFFFFF",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.25s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#10B981";
                                e.currentTarget.style.background = "rgba(16,185,129,0.08)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            Diagnóstico Gratuito + PDF
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Columna derecha: formulario (se oculta cuando el quiz está abierto) ── */}
                    {!isQuizOpen && (
                        <div
                            style={{
                                position: "relative",
                                zIndex: 3,
                            }}
                        >
                            <LeadForm />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quiz Modal ── */}
            <QuizFunnel
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
            />
        </section>
    );
}
