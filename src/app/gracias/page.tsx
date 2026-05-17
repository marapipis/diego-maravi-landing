import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gracias por registrarte — Diego Maraví",
    description: "Ya puedes descargar tu guía básica de criptomonedas.",
    robots: "noindex, nofollow",
};

const PDF_URL =
    "https://drive.google.com/file/d/1F3hZng7WuW81Ik2FBxzlTcd4WzMiVZ33/view?usp=sharing";
const WHATSAPP_URL = "https://wa.me/51986913780";

export default function GraciasPage() {
    return (
        <main
            className="hero-bg"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1rem",
            }}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: "480px",
                    width: "100%",
                    padding: "3rem 2.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                {/* Checkmark animado */}
                <div
                    className="check-animate"
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "2px solid rgba(16, 185, 129, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "2rem",
                        flexShrink: 0,
                    }}
                >
                    <svg
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                {/* Título */}
                <h1
                    className="fade-in-up"
                    style={{
                        fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: "0 0 1rem 0",
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        animationDelay: "0.15s",
                        opacity: 0,
                    }}
                >
                    Gracias por registrarte.
                </h1>

                {/* Subtítulo */}
                <p
                    className="fade-in-up"
                    style={{
                        color: "#D1D5DB",
                        fontSize: "1rem",
                        lineHeight: 1.65,
                        margin: "0 0 2rem 0",
                        animationDelay: "0.3s",
                        opacity: 0,
                    }}
                >
                    Ya puedes descargar la guía básica para empezar en
                    criptomonedas. Revísala con calma y, si tienes dudas antes
                    de tu primera compra o trade, puedes escribirme por WhatsApp.
                </p>

                {/* Botón principal — Descargar guía */}
                <div
                    className="fade-in-up"
                    style={{ width: "100%", animationDelay: "0.45s", opacity: 0 }}
                >
                    <a
                        href={PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cta"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Descargar guía
                    </a>
                </div>

                {/* Botón secundario — WhatsApp */}
                <div
                    className="fade-in-up"
                    style={{
                        width: "100%",
                        marginTop: "0.875rem",
                        animationDelay: "0.55s",
                        opacity: 0,
                    }}
                >
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                            width: "100%",
                            minHeight: "52px",
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Contactar por WhatsApp
                    </a>
                </div>

                {/* Disclaimer */}
                <p
                    className="fade-in-up"
                    style={{
                        marginTop: "2rem",
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        lineHeight: 1.5,
                        animationDelay: "0.65s",
                        opacity: 0,
                    }}
                >
                    Contenido educativo e informativo. No constituye asesoría
                    financiera ni recomendación de inversión.
                </p>
            </div>
        </main>
    );
}
