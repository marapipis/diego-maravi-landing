"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
    { label: "Por qué", href: "#por-que" },
    { label: "Qué aprenderás", href: "#antes-operar" },
    { label: "Quién soy", href: "#quien-soy" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav
            className="flex items-center justify-between"
            style={{
                padding: "1rem 1.5rem",
                maxWidth: "1280px",
                margin: "0 auto",
                position: "relative",
            }}
        >
            <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="18" width="6" height="10" rx="1" fill="#10B981" />
                    <rect x="13" y="12" width="6" height="16" rx="1" fill="#10B981" opacity="0.7" />
                    <rect x="22" y="6" width="6" height="22" rx="1" fill="#10B981" opacity="0.4" />
                </svg>
                <span style={{ color: "#FFFFFF", fontSize: "1.125rem", fontWeight: 300 }}>
                    Diego <span style={{ fontWeight: 800 }}>Maraví</span>
                </span>
            </Link>

            <div className="hidden md:flex items-center" style={{ gap: "2rem" }}>
                {NAV_LINKS.map((link) => (
                    <a key={link.label} href={link.href} className="nav-link">
                        {link.label}
                    </a>
                ))}
                <a
                    href="#registro"
                    className="btn-ghost"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                    Quiero mi guía
                </a>
            </div>

            <button
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                style={{
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                }}
            >
                {mobileOpen ? "✕" : "☰"}
            </button>

            {mobileOpen && (
                <div
                    className="md:hidden"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "rgba(10, 14, 26, 0.98)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        padding: "1.5rem",
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="nav-link"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#registro"
                        className="btn-ghost"
                        style={{ justifyContent: "center" }}
                        onClick={() => setMobileOpen(false)}
                    >
                        Quiero mi guía
                    </a>
                </div>
            )}
        </nav>
    );
}
