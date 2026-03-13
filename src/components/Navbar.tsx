"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
    { label: "El Método", href: "#" },
    { label: "Servicios", href: "#" },
    { label: "Testimonios", href: "#" },
    { label: "Blog", href: "#" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav
            className="flex items-center justify-between"
            style={{
                padding: "1.25rem 3rem",
                maxWidth: "1280px",
                margin: "0 auto",
            }}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="18" width="6" height="10" rx="1" fill="#00A8E8" />
                    <rect x="13" y="12" width="6" height="16" rx="1" fill="#00A8E8" opacity="0.7" />
                    <rect x="22" y="6" width="6" height="22" rx="1" fill="#00A8E8" opacity="0.4" />
                </svg>
                <span style={{ color: "#FFFFFF", fontSize: "1.25rem", fontWeight: 300 }}>
                    Diego{" "}
                    <span style={{ fontWeight: 800 }}>Maravi</span>
                </span>
            </Link>

            {/* Desktop Links */}
            <div
                className="hidden md:flex items-center"
                style={{ gap: "2rem" }}
            >
                {NAV_LINKS.map((link) => (
                    <a key={link.label} href={link.href} className="nav-link">
                        {link.label}
                    </a>
                ))}
            </div>

            {/* Mobile hamburger */}
            <button
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Abrir menú de navegación"
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

            {/* Mobile menu */}
            {mobileOpen && (
                <div
                    className="md:hidden"
                    style={{
                        position: "absolute",
                        top: "80px",
                        left: 0,
                        right: 0,
                        background: "rgba(11, 17, 32, 0.98)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        padding: "1.5rem 2rem",
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
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
                </div>
            )}
        </nav>
    );
}
