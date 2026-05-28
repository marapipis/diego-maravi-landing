const ERRORS = [
    "Invertir todo lo que tienes en una sola moneda",
    "Comprar por FOMO porque “todos lo están haciendo”",
    "Operar con apalancamiento sin entender el riesgo",
    "Creer en promesas de ganancias rápidas o señales mágicas",
];

const LEARN = [
    "Conceptos básicos: qué es cripto, blockchain, exchange y wallet",
    "Cómo elegir tu primera operación sin actuar por impulso",
    "Gestión de capital y tamaño de posición",
    "Cómo identificar contenido confiable, plataformas y riesgos antes de registrarte",
];

const Bullet = ({ children, type }: { children: string; type: "x" | "check" }) => (
    <li
        style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "0.625rem 0",
            color: "#D1D5DB",
            fontSize: "0.9375rem",
            lineHeight: 1.5,
        }}
    >
        <span
            style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background:
                    type === "check" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: type === "check" ? "#10B981" : "#F87171",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
            }}
            aria-hidden="true"
        >
            {type === "check" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            )}
        </span>
        <span>{children}</span>
    </li>
);

export default function BeforeTrading() {
    return (
        <section
            id="antes-operar"
            style={{
                background: "var(--brand-surface-2)",
                padding: "5rem 1.25rem",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
        >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <span className="section-eyebrow">Antes de operar, aprende primero</span>
                    <h2 className="section-title">Antes de operar, entiende qué puede salir mal</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
                        Muchos pierden dinero por entrar tarde, usar demasiado apalancamiento o copiar
                        señales sin entenderlas. Esta guía te ayuda a filtrar mejor antes de decidir.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    <div className="surface-card" style={{ padding: "1.75rem" }}>
                        <h3 style={{ color: "#F87171", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1rem 0" }}>
                            Errores comunes a evitar
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {ERRORS.map((e) => (
                                <Bullet key={e} type="x">{e}</Bullet>
                            ))}
                        </ul>
                    </div>

                    <div className="surface-card" style={{ padding: "1.75rem" }}>
                        <h3 style={{ color: "#10B981", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1rem 0" }}>
                            Lo que aprenderás
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {LEARN.map((e) => (
                                <Bullet key={e} type="check">{e}</Bullet>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
