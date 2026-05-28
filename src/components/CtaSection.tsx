import LeadForm from "./LeadForm";

export default function CtaSection() {
    return (
        <section
            id="registro-final"
            style={{
                background:
                    "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 65%), var(--brand-bg)",
                padding: "5rem 1.25rem",
            }}
        >
            <div
                style={{
                    maxWidth: "780px",
                    margin: "0 auto",
                    textAlign: "center",
                }}
            >
                <span className="section-eyebrow">Tu siguiente paso</span>
                <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                    Recibe la guía y decide con más criterio
                </h2>
                <p
                    className="section-subtitle"
                    style={{ margin: "0 auto 2.25rem auto", textAlign: "center", maxWidth: "560px" }}
                >
                    Déjame tus datos y te enviaré la guía a tu correo. Si tu perfil encaja, también podré
                    orientarte sobre cómo empezar a aprender y operar de forma más ordenada.
                </p>
                <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "left" }}>
                    <LeadForm formId="cta-form" />
                </div>
            </div>
        </section>
    );
}
