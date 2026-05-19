import Link from "next/link";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0A0E1A",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "2rem",
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            <p style={{ color: "#10B981", fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                Error 404
            </p>
            <h1 style={{ color: "#FFFFFF", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "1rem" }}>
                Página no encontrada
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "1rem", marginBottom: "2rem" }}>
                El enlace que buscas no existe o fue movido.
            </p>
            <Link
                href="/"
                style={{
                    background: "linear-gradient(135deg, #10B981, #34D399)",
                    color: "#052E1F",
                    fontWeight: 700,
                    padding: "0.875rem 1.75rem",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontSize: "1rem",
                }}
            >
                Volver al inicio
            </Link>
        </div>
    );
}
