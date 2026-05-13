"use client";

import { useState } from "react";
import Image from "next/image";
import LeadForm from "./LeadForm";
import QuizFunnel from "./QuizFunnel";

const BENEFITS = [
    "Aprende a evitar los errores más comunes al empezar en cripto",
    "Conoce cómo gestionar tu riesgo antes de operar",
    "Recibe contenido educativo, sin promesas de ganancias",
];

export default function Hero() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <>
            <section
                id="main-content"
                className="hero-bg"
                style={{ position: "relative", overflow: "hidden", paddingBottom: "3rem" }}
                aria-label="Guía cripto gratuita"
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "2.5rem 1.25rem 2rem",
                        position: "relative",
                    }}
                >
                    {/* Coach photo — absolute en desktop, decorativa */}
                    <div
                        className="coach-photo-container"
                        style={{
                            position: "absolute",
                            top: "5rem",
                            right: "-2rem",
                            width: "360px",
                            height: "520px",
                            zIndex: 1,
                            pointerEvents: "none",
                        }}
                        aria-hidden="true"
                    >
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "60px" }}>
                            <div style={{ position: "relative", width: 0, height: 0 }}>
                                <div style={{ position: "absolute", top: "-200px", left: "-200px", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(16,185,129,0.08)" }} />
                                <div style={{ position: "absolute", top: "-260px", left: "-260px", width: "520px", height: "520px", borderRadius: "50%", border: "1px solid rgba(16,185,129,0.04)" }} />
                                <div style={{ position: "absolute", top: "-90px", left: "-90px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }} />
                            </div>
                        </div>
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <Image
                                src="/coach-diego.png"
                                alt="Diego Maraví"
                                fill
                                style={{
                                    objectFit: "contain",
                                    objectPosition: "top center",
                                    filter: "drop-shadow(0 0 40px rgba(16,185,129,0.25)) drop-shadow(0 0 80px rgba(16,185,129,0.10))",
                                }}
                                sizes="(max-width: 1024px) 240px, 360px"
                                priority
                                quality={85}
                            />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to top, var(--brand-bg) 0%, transparent 100%)" }} />
                        </div>
                    </div>

                    {/* Content grid */}
                    <div
                        className="hero-content-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 440px",
                            gap: "3rem",
                            alignItems: "flex-start",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        {/* Columna texto */}
                        <div className="hero-text-col" style={{ maxWidth: "56%", position: "relative", zIndex: 3 }}>
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "0.375rem 0.75rem",
                                    background: "rgba(16,185,129,0.1)",
                                    border: "1px solid rgba(16,185,129,0.3)",
                                    color: "#34D399",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    borderRadius: "999px",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                Educación cripto · Acceso gratuito
                            </span>

                            <h1
                                style={{
                                    fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    marginBottom: "1rem",
                                    color: "#FFFFFF",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Aprende a invertir en cripto{" "}
                                <span style={{ color: "#10B981" }}>sin perder tu dinero</span>
                            </h1>

                            <p
                                style={{
                                    fontSize: "1.125rem",
                                    color: "#D1D5DB",
                                    lineHeight: 1.6,
                                    maxWidth: "520px",
                                    marginBottom: "1.75rem",
                                }}
                            >
                                Una guía gratuita para entender el mercado, gestionar el riesgo y dar tus
                                primeros pasos en cripto con criterio. Sin jerga complicada y sin promesas.
                            </p>

                            {/* Benefits */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                                {BENEFITS.map((b) => (
                                    <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                                        <div className="benefit-check">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span style={{ color: "#D1D5DB", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                                            {b}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                                <a
                                    href="#registro"
                                    className="btn-cta"
                                    style={{
                                        width: "auto",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        textDecoration: "none",
                                        padding: "0.95rem 1.75rem",
                                    }}
                                >
                                    Quiero mi guía gratuita
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => setIsQuizOpen(true)}
                                    className="btn-ghost"
                                    type="button"
                                >
                                    Hacer un diagnóstico rápido
                                </button>
                            </div>

                            <p style={{ marginTop: "1rem", color: "#6B7280", fontSize: "0.8125rem" }}>
                                Contenido educativo. No constituye asesoría financiera.
                            </p>
                        </div>

                        {/* Columna form (desktop) */}
                        <div id="registro" style={{ position: "relative", zIndex: 3 }}>
                            <LeadForm formId="hero-form" />
                        </div>
                    </div>
                </div>
            </section>

            <QuizFunnel isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        </>
    );
}
