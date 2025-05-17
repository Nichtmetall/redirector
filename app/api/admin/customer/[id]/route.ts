import { prisma } from '@/lib/db';
import { checkAdminToken, errorResponse } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';

// Kundendetails abrufen
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: params.id,
            },
            include: {
                redirects: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!customer) {
            return errorResponse('Kunde nicht gefunden', 404);
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Fehler beim Abrufen des Kunden:', error);
        return errorResponse('Fehler beim Abrufen des Kunden', 500);
    }
}

// Kunde aktualisieren
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Überprüfen, ob die Form-ID vorhanden ist
        if (!data.formId) {
            return errorResponse('Form-ID ist erforderlich', 400);
        }

        // Überprüfen, ob der Kunde existiert
        const existingCustomer = await prisma.customer.findUnique({
            where: { id: params.id },
        });

        if (!existingCustomer) {
            return errorResponse('Kunde nicht gefunden', 404);
        }

        // Kunde aktualisieren
        const updatedCustomer = await prisma.customer.update({
            where: { id: params.id },
            data: {
                formId: data.formId,
            },
            include: {
                redirects: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Kunden:', error);
        return errorResponse('Fehler beim Aktualisieren des Kunden', 500);
    }
}

// Kunde löschen
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Admin-Token überprüfen
    const authError = await checkAdminToken(request);
    if (authError) return authError;

    try {
        // Prüfen, ob Kunde existiert
        const customer = await prisma.customer.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!customer) {
            return errorResponse('Kunde nicht gefunden', 404);
        }

        // Kunde löschen (inkl. aller Weiterleitungen durch Cascade)
        await prisma.customer.delete({
            where: {
                id: params.id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Fehler beim Löschen des Kunden:', error);
        return errorResponse('Fehler beim Löschen des Kunden', 500);
    }
} 