export default function Footer() {
    return (
        <footer
            style={{
                background: "var(--brand-surface-2)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "2.5rem 1.25rem",
            }}
        >
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ color: "#6B7280", fontSize: "0.8125rem", maxWidth: "560px", lineHeight: 1.6 }}>
                    <strong style={{ color: "#9CA3AF" }}>Aviso legal:</strong> El contenido de esta
                    web tiene fines exclusivamente educativos y no constituye asesoría financiera,
                    legal ni de inversión. Operar en criptoactivos implica riesgos significativos y
                    puede provocar la pérdida total del capital. Nunca inviertas dinero que no puedas
                    permitirte perder.
                </div>
                <div style={{ color: "#6B7280", fontSize: "0.8125rem" }}>
                    © {new Date().getFullYear()} Diego Maraví — Educación cripto
                </div>
            </div>
        </footer>
    );
}
