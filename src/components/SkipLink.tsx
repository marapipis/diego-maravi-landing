"use client";

export default function SkipLink() {
    return (
        <a
            href="#main-content"
            className="skip-link"
            style={{
                position: "absolute",
                top: "-100px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#00A8E8",
                color: "#FFFFFF",
                padding: "0.75rem 1.5rem",
                borderRadius: "0 0 8px 8px",
                zIndex: 99999,
                fontWeight: 600,
                textDecoration: "none",
                transition: "top 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.top = "0")}
            onBlur={(e) => (e.currentTarget.style.top = "-100px")}
        >
            Saltar al contenido principal
        </a>
    );
}
