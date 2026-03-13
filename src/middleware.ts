import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Headers de seguridad (PRD sección 12.4)
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.amplitude.com",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self' api.resend.com *.supabase.co api.amplitude.com",
            "frame-ancestors 'none'",
        ].join("; ")
    );

    return response;
}

export const config = {
    // Aplicar middleware a todas las rutas excepto assets estáticos
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
