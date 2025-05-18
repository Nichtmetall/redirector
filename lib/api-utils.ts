import { NextRequest, NextResponse } from "next/server";

export async function checkAdminToken(request: NextRequest) {
    // Prüfe zuerst den Authorization-Header
    const authHeader = request.headers.get('Authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        // Falls kein Authorization-Header vorhanden, prüfe den Query-Parameter
        const url = new URL(request.url);
        token = url.searchParams.get('token');
    }

    if (!token || token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json(
            { error: "Nicht autorisiert" },
            { status: 401 }
        );
    }

    return null;
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json(
        { error: message },
        { status }
    );
} 