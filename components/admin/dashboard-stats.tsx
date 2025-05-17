'use client';

import { Card, CardContent } from "@/components/ui/card";

type DashboardStatsProps = {
    customers: Array<{
        id: string;
        _count?: {
            redirects: number;
        };
    }>;
};

export function DashboardStats({ customers }: DashboardStatsProps) {
    // Berechne die Statistiken
    const totalCustomers = customers.length;
    const totalRedirects = customers.reduce((sum, customer) => sum + (customer._count?.redirects || 0), 0);
    const avgRedirectsPerCustomer = totalCustomers > 0
        ? (totalRedirects / totalCustomers).toFixed(1)
        : '0';

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalCustomers}</div>
                    <p className="text-muted-foreground">Aktive Kunden</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalRedirects}</div>
                    <p className="text-muted-foreground">Gesamt Weiterleitungen</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{avgRedirectsPerCustomer}</div>
                    <p className="text-muted-foreground">⌀ Weiterleitungen pro Kunde</p>
                </CardContent>
            </Card>
        </div>
    );
} 