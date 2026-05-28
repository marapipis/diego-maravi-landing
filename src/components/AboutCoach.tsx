import Image from "next/image";

export default function AboutCoach() {
    return (
        <section
            id="quien-soy"
            style={{
                background: "var(--brand-bg)",
                padding: "5rem 1.25rem",
            }}
        >
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "3rem",
                    alignItems: "center",
                }}
            >
                <div style={{ position: "relative", minHeight: "320px" }}>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                width: "260px",
                                height: "260px",
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
                            }}
                        />
                        <div style={{ position: "relative", width: "260px", height: "320px" }}>
                            <Image
                                src="/coach-diego.png"
                                alt="Diego Maraví"
                                fill
                                style={{
                                    objectFit: "contain",
                                    objectPosition: "center",
                                    filter: "drop-shadow(0 0 30px rgba(16,185,129,0.2))",
                                }}
                                sizes="260px"
                                quality={85}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <span className="section-eyebrow">Quién soy</span>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        Diego Maraví
                    </h2>
                    <p style={{ color: "#D1D5DB", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                        Llevo varios años estudiando mercados financieros y cripto. Trabajo acompañando
                        traders y usuarios que quieren entender mejor el ecosistema antes de operar con
                        dinero real.
                    </p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                        Mi enfoque es 100% educativo. No vendo señales, no prometo rentabilidad y no
                        creo en atajos. Lo que sí encontrarás aquí son fundamentos, gestión de riesgo,
                        criterio y orientación para dar el siguiente paso de forma más ordenada.
                    </p>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                        }}
                    >
                        {["Educación cripto", "Gestión de riesgo", "Análisis técnico", "Bitunix ecosystem"].map((t) => (
                            <span
                                key={t}
                                style={{
                                    display: "inline-block",
                                    padding: "0.375rem 0.75rem",
                                    background: "rgba(16,185,129,0.08)",
                                    border: "1px solid rgba(16,185,129,0.2)",
                                    color: "#34D399",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    borderRadius: "999px",
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
