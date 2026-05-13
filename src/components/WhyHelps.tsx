const ITEMS = [
    {
        title: "Empieza desde cero, con bases sólidas",
        desc: "Entenderás qué es realmente una criptomoneda, cómo funcionan los exchanges y qué pasos tomar antes de tu primera operación.",
        iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    },
    {
        title: "Aprende a leer el mercado antes de operar",
        desc: "Conoce los conceptos básicos de análisis técnico y fundamental para tomar decisiones con criterio, no por impulso.",
        iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    },
    {
        title: "Gestiona el riesgo como un profesional",
        desc: "Las pérdidas son parte del juego. Te enseño a limitarlas y a proteger tu capital antes de pensar en rentabilidad.",
        iconPath: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    },
    {
        title: "Decide qué tipo de operación es para ti",
        desc: "Spot, futuros, holding... Cada estrategia tiene sus tiempos y riesgos. La guía te ayuda a saber cuál encaja con tu perfil.",
        iconPath: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z",
    },
];

export default function WhyHelps() {
    return (
        <section
            id="por-que"
            style={{
                background: "var(--brand-bg)",
                padding: "5rem 1.25rem",
                position: "relative",
            }}
        >
            <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
                <span className="section-eyebrow">Por qué esta guía puede ayudarte</span>
                <h2 className="section-title">
                    Aprende cripto con criterio, no a ciegas
                </h2>
                <p className="section-subtitle" style={{ margin: "0 auto 3rem auto", textAlign: "center" }}>
                    Esta guía es para personas que están empezando o que ya operan pero sienten que les
                    falta una base sólida. Nada de promesas: solo educación clara.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "1.25rem",
                        textAlign: "left",
                    }}
                >
                    {ITEMS.map((item) => (
                        <div key={item.title} className="surface-card">
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    background: "rgba(16,185,129,0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "1rem",
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={item.iconPath} />
                                </svg>
                            </div>
                            <h3 style={{ color: "#FFFFFF", fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 0.5rem 0", lineHeight: 1.35 }}>
                                {item.title}
                            </h3>
                            <p style={{ color: "#9CA3AF", fontSize: "0.9375rem", lineHeight: 1.55, margin: 0 }}>
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
