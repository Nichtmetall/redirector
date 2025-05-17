'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    example?: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
    {
        method: 'GET',
        path: '/api/admin/customer',
        description: 'Liste aller Kunden abrufen',
        example: '/api/admin/customer?token=YOUR_TOKEN'
    },
    {
        method: 'POST',
        path: '/api/admin/customer',
        description: 'Neuen Kunden erstellen',
        example: '/api/admin/customer?token=YOUR_TOKEN\n\nBody:\n{\n  "id": "kunde1",\n  "formId": "abc123"\n}'
    },
    {
        method: 'GET',
        path: '/api/admin/customer/[id]',
        description: 'Details eines Kunden abrufen',
        example: '/api/admin/customer/kunde1?token=YOUR_TOKEN'
    },
    {
        method: 'PUT',
        path: '/api/admin/customer/[id]',
        description: 'Kunden aktualisieren',
        example: '/api/admin/customer/kunde1?token=YOUR_TOKEN\n\nBody:\n{\n  "formId": "xyz789"\n}'
    },
    {
        method: 'DELETE',
        path: '/api/admin/customer/[id]',
        description: 'Kunden löschen',
        example: '/api/admin/customer/kunde1?token=YOUR_TOKEN'
    },
    {
        method: 'POST',
        path: '/api/admin/redirect',
        description: 'Neue Weiterleitung erstellen',
        example: '/api/admin/redirect?token=YOUR_TOKEN\n\nBody:\n{\n  "customerId": "kunde1",\n  "am_id": "12345",\n  "empfehlungsgeber": "Max Mustermann"\n}'
    },
    {
        method: 'DELETE',
        path: '/api/admin/redirect/[customerId]/[code]',
        description: 'Weiterleitung löschen',
        example: '/api/admin/redirect/kunde1/12345?token=YOUR_TOKEN'
    }
];

const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
};

export function ApiEndpoints() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('In die Zwischenablage kopiert');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                    Übersicht aller verfügbaren API-Endpunkte. Klicken Sie auf das Kopier-Symbol, um den Endpoint oder das Beispiel zu kopieren.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Methode</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Beschreibung</TableHead>
                            <TableHead className="w-24">Beispiel</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {API_ENDPOINTS.map((endpoint, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${methodColors[endpoint.method]}`}>
                                        {endpoint.method}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono">
                                    <div className="flex items-center gap-2">
                                        {endpoint.path}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(endpoint.path)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>{endpoint.description}</TableCell>
                                <TableCell>
                                    {endpoint.example && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(endpoint.example!)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 