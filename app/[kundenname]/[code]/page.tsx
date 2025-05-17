import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Exportiere eine Metadaten-Funktion, die einen Redirect-Header setzt
export async function generateMetadata({
    params
}: {
    params: { kundenname: string; code: string };
}): Promise<Metadata> {
    const { kundenname, code } = params;
    // Hier ist code jetzt der am_id-Wert aus der URL

    try {
        // Suche den Kunden
        const customer = await prisma.customer.findUnique({
            where: { id: kundenname },
        });

        if (!customer) {
            return { title: 'Fehler - Kunde nicht gefunden' };
        }

        // Suche die Weiterleitung anhand der am_id
        const redirectData = await prisma.redirect.findFirst({
            where: {
                am_id: code,
                customerId: kundenname,
            },
        });

        if (!redirectData) {
            return { title: 'Fehler - Weiterleitung nicht gefunden' };
        }

        // Erhöhe den Counter und aktualisiere das updatedAt-Feld
        await prisma.redirect.update({
            where: {
                code_customerId: {
                    code: redirectData.code, // Hier den internen code verwenden
                    customerId: kundenname,
                },
            },
            data: { count: { increment: 1 } },
        });

        // Konstruiere die Ziel-URL
        const targetUrl = `https://api.leadconnectorhq.com/widget/form/${customer.formId}?am_id=${code}&empfehlungsgeber=${redirectData.empfehlungsgeber}`;

        return {
            title: 'Weiterleitung...',
            other: {
                'refresh': `0;url=${targetUrl}`
            }
        };
    } catch (error) {
        console.error('Fehler bei der Weiterleitung (Metadata):', error);
        return { title: 'Fehler' };
    }
}

export default async function RedirectPage({
    params
}: {
    params: { kundenname: string; code: string };
}) {
    const { kundenname, code } = params;
    // Hier ist code jetzt der am_id-Wert aus der URL

    try {
        // Suche den Kunden
        const customer = await prisma.customer.findUnique({
            where: {
                id: kundenname,
            },
        });

        if (!customer) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold">Fehler</h1>
                    <p>Kunde nicht gefunden</p>
                </div>
            );
        }

        // Suche die Weiterleitung anhand der am_id
        const redirectData = await prisma.redirect.findFirst({
            where: {
                am_id: code,
                customerId: kundenname,
            },
        });

        if (!redirectData) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold">Fehler</h1>
                    <p>Weiterleitung nicht gefunden</p>
                </div>
            );
        }

        // Konstruiere die Ziel-URL - die am_id direkt aus der URL verwenden
        const targetUrl = `https://api.leadconnectorhq.com/widget/form/${customer.formId}?am_id=${code}&empfehlungsgeber=${redirectData.empfehlungsgeber}`;

        // Fallback-Seite mit Link zur Ziel-URL
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Weiterleitung...</h1>
                <p className="mb-4">Sie werden weitergeleitet...</p>
                <p>
                    Falls Sie nicht automatisch weitergeleitet werden,
                    <a href={targetUrl} className="text-blue-500 ml-1 hover:underline">klicken Sie hier</a>.
                </p>

                {/* Client-seitiges JavaScript für zusätzliche Weiterleitung */}
                <script
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: `
                            setTimeout(function() {
                                window.location.href = "${targetUrl}";
                            }, 1000);
                        `
                    }}
                />
            </div>
        );
    } catch (error) {
        console.error('Fehler bei der Weiterleitung:', error);

        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Fehler</h1>
                <p>Ein unerwarteter Fehler ist aufgetreten</p>
            </div>
        );
    }
} 