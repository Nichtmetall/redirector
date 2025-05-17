import { prisma } from '@/lib/db';
import { checkAdminToken, errorResponse } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';

// Neue Weiterleitung erstellen
export async function POST(request: NextRequest) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validierung
        if (!data.code || !data.customerId || !data.am_id || !data.empfehlungsgeber) {
            return errorResponse('Alle Felder (code, customerId, am_id, empfehlungsgeber) sind erforderlich');
        }

        // Prüfen, ob Kunde existiert
        const customer = await prisma.customer.findUnique({
            where: {
                id: data.customerId,
            },
        });

        if (!customer) {
            return errorResponse('Kunde nicht gefunden', 404);
        }

        // Prüfen, ob Weiterleitung bereits existiert (anhand des internen Codes)
        const existingRedirectByCode = await prisma.redirect.findUnique({
            where: {
                code_customerId: {
                    code: data.code,
                    customerId: data.customerId,
                },
            },
        });

        if (existingRedirectByCode) {
            return errorResponse('Weiterleitung mit diesem internen Code existiert bereits für diesen Kunden');
        }

        // Prüfen, ob Weiterleitung mit dieser am_id bereits existiert
        const existingRedirectByAmId = await prisma.redirect.findFirst({
            where: {
                am_id: data.am_id,
                customerId: data.customerId,
            },
        });

        if (existingRedirectByAmId) {
            return errorResponse('Weiterleitung mit dieser AM ID existiert bereits für diesen Kunden');
        }

        // Neue Weiterleitung erstellen
        const redirect = await prisma.redirect.create({
            data: {
                code: data.code,
                customerId: data.customerId,
                am_id: data.am_id,
                empfehlungsgeber: data.empfehlungsgeber,
            },
        });

        return NextResponse.json(redirect, { status: 201 });
    } catch (error) {
        console.error('Fehler beim Erstellen der Weiterleitung:', error);
        return errorResponse('Fehler beim Erstellen der Weiterleitung', 500);
    }
} 