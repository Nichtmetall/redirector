import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { kundenname: string; code: string } }
) {
    const paramsResolved = await Promise.resolve(params);
    const { kundenname, code } = paramsResolved;

    try {
        // Suche den Kunden
        const customer = await prisma.customer.findUnique({
            where: {
                id: kundenname,
            },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Kunde nicht gefunden' },
                { status: 404 }
            );
        }

        // Suche die Weiterleitung anhand der am_id
        const redirect = await prisma.redirect.findUnique({
            where: {
                am_id_customerId: {
                    am_id: code,
                    customerId: kundenname,
                },
            },
        });

        if (!redirect) {
            return NextResponse.json(
                { error: 'Weiterleitung nicht gefunden' },
                { status: 404 }
            );
        }

        // Erhöhe den Counter und aktualisiere das updatedAt-Feld
        await prisma.redirect.update({
            where: {
                am_id_customerId: {
                    am_id: code,
                    customerId: kundenname,
                },
            },
            data: {
                count: {
                    increment: 1,
                },
            },
        });

        // Konstruiere die Ziel-URL
        const targetUrl = new URL(`https://api.leadconnectorhq.com/widget/form/${customer.formId}`);
        targetUrl.searchParams.append('am_id', code);
        targetUrl.searchParams.append('empfehlungsgeber', redirect.empfehlungsgeber);

        // Leite zum Ziel weiter
        return NextResponse.redirect(targetUrl.toString(), { status: 302 });
    } catch (error) {
        console.error('Fehler bei der Weiterleitung:', error);
        return NextResponse.json(
            { error: 'Interner Server-Fehler' },
            { status: 500 }
        );
    }
} 