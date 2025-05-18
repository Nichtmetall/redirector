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
        if (!data.customerId || !data.am_id || !data.empfehlungsgeber) {
            return errorResponse('Alle Felder (customerId, am_id, empfehlungsgeber) sind erforderlich');
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

        // Prüfen, ob Weiterleitung mit dieser am_id bereits existiert
        const existingRedirect = await prisma.redirect.findUnique({
            where: {
                am_id_customerId: {
                    am_id: data.am_id,
                    customerId: data.customerId,
                },
            },
        });

        if (existingRedirect) {
            return errorResponse('Weiterleitung mit dieser AM ID existiert bereits für diesen Kunden');
        }

        // Neue Weiterleitung erstellen
        const redirect = await prisma.redirect.create({
            data: {
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