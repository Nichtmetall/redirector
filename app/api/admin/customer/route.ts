import { prisma } from '@/lib/db';
import { checkAdminToken, errorResponse } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';

// Alle Kunden abrufen
export async function GET(request: NextRequest) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        const customers = await prisma.customer.findMany({
            include: {
                _count: {
                    select: {
                        redirects: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Fehler beim Abrufen der Kunden:', error);
        return errorResponse('Fehler beim Abrufen der Kunden', 500);
    }
}

// Neuen Kunden erstellen
export async function POST(request: NextRequest) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validierung
        if (!data.id || !data.formId) {
            return errorResponse('ID und formId sind erforderlich');
        }

        // Prüfen, ob Kunde mit dieser ID bereits existiert
        const existingCustomer = await prisma.customer.findUnique({
            where: {
                id: data.id,
            },
        });

        if (existingCustomer) {
            return errorResponse('Kunde mit dieser ID existiert bereits');
        }

        // Neuen Kunden erstellen
        const customer = await prisma.customer.create({
            data: {
                id: data.id,
                formId: data.formId,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Fehler beim Erstellen des Kunden:', error);
        return errorResponse('Fehler beim Erstellen des Kunden', 500);
    }
} 