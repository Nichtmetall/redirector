import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignoriere API-Routen und Admin-Bereich
    if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname === '/') {
        return NextResponse.next();
    }

    // Prüfe, ob es sich um eine Weiterleitungs-URL handelt
    const pathParts = pathname.split('/').filter(Boolean);

    // Wenn wir genau zwei Teile haben (kundenname/am_id), leite zur API-Route weiter
    if (pathParts.length === 2) {
        const [kundenname, am_id] = pathParts;

        // Leite zur API-Route weiter, die die Datenbankoperationen durchführt
        // Die am_id wird als code-Parameter verwendet
        const url = request.nextUrl.clone();
        url.pathname = `/api/redirect/${kundenname}/${am_id}`;

        return NextResponse.rewrite(url);
    }

    // Standard: Normales Verhalten
    return NextResponse.next();
}

// Konfiguriere Middleware nur für bestimmte Pfade
export const config = {
    matcher: [
        /*
         * Matcher für Pfade, die nicht mit api/ oder _next/ beginnen
         * und nicht /admin oder / sind
         */
        '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
    ],
}; 