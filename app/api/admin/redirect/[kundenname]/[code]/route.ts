import { prisma } from '@/lib/db';
import { checkAdminToken, errorResponse } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';

// Weiterleitung löschen
export async function DELETE(
    request: NextRequest,
    { params }: { params: { kundenname: string; code: string } }
) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        // Prüfen, ob Weiterleitung existiert über den internen code-Parameter
        const redirect = await prisma.redirect.findUnique({
            where: {
                am_id_customerId: {
                    am_id: params.code,
                    customerId: params.kundenname,
                },
            },
        });

        if (!redirect) {
            return errorResponse('Weiterleitung nicht gefunden', 404);
        }

        // Weiterleitung löschen
        await prisma.redirect.delete({
            where: {
                am_id_customerId: {
                    am_id: params.code,
                    customerId: params.kundenname,
                },
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Fehler beim Löschen der Weiterleitung:', error);
        return errorResponse('Fehler beim Löschen der Weiterleitung', 500);
    }
} 