import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SkipLink from "@/components/SkipLink";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aprende a invertir en cripto sin perder tu dinero — Guía gratuita",
  description:
    "Guía gratuita de educación cripto: aprende a entender el mercado, gestionar el riesgo y dar tus primeros pasos con criterio. Sin promesas de rentabilidad.",
  keywords: [
    "guía cripto",
    "aprender cripto",
    "criptomonedas",
    "educación cripto",
    "Bitunix",
    "gestión de riesgo",
  ],
  openGraph: {
    title: "Aprende a invertir en cripto sin perder tu dinero",
    description:
      "Guía gratuita de educación cripto: entiende el mercado, gestiona el riesgo y da tus primeros pasos con criterio.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.diegomaravi.com",
    siteName: "Diego Maraví",
    type: "website",
    locale: "es_PE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <SkipLink />
        <noscript>
          <div style={{
            background: "#0A0E1A",
            color: "#FFFFFF",
            textAlign: "center",
            padding: "2rem",
            fontSize: "1.125rem",
          }}>
            Para usar este sitio necesitas activar JavaScript en tu navegador.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
