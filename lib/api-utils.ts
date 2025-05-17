import { NextRequest, NextResponse } from "next/server";

export async function checkAdminToken(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: "Nicht autorisiert" },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1];

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