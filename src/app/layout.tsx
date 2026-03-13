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
  title: "Diego Maravi · Coach Financiero — Evaluación Gratuita",
  description:
    "Construye tu patrimonio con la guía de un coach financiero. Completa tu evaluación financiera gratuita y da el primer paso hacia tu libertad financiera.",
  keywords: [
    "coach financiero",
    "inversiones",
    "libertad financiera",
    "asesoría financiera",
    "patrimonio",
  ],
  openGraph: {
    title: "Diego Maravi · Coach Financiero",
    description:
      "Evaluación financiera gratuita. Da el primer paso hacia tu libertad financiera.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.diegomaravi.com",
    siteName: "Diego Maravi",
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
            background: "#0B1120",
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
