"use client";

export default function SuccessMessage() {
    return (
        <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "3rem 1.5rem", minHeight: "420px" }}
        >
            {/* Animated check circle */}
            <div
                className="check-animate"
                style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                }}
            >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>

            <h3
                className="fade-in-up"
                style={{
                    fontSize: "1.375rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginBottom: "0.75rem",
                    animationDelay: "0.15s",
                    opacity: 0,
                }}
            >
                ¡Evaluación recibida!
            </h3>

            <p
                className="fade-in-up"
                style={{
                    color: "#9CA3AF",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    maxWidth: "320px",
                    animationDelay: "0.3s",
                    opacity: 0,
                }}
            >
                Diego revisará tu perfil y te contactará en las próximas 24 horas
                para agendar tu primera sesión gratuita.
            </p>

            <div
                className="fade-in-up"
                style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.25rem",
                    background: "rgba(16, 185, 129, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    fontSize: "0.8125rem",
                    color: "#10B981",
                    animationDelay: "0.45s",
                    opacity: 0,
                }}
            >
                📧 Revisa tu correo para la confirmación
            </div>
        </div>
    );
}
