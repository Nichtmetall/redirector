'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Redirect {
    code: string;
    am_id: string;
    empfehlungsgeber: string;
    createdAt: string;
    updatedAt: string;
    count: number;
}

interface CustomerStatsProps {
    redirects: Redirect[];
}

export function CustomerStats({ redirects }: CustomerStatsProps) {
    // KPIs berechnen
    const totalRedirects = redirects.length;
    const totalClicks = redirects.reduce((sum, redirect) => sum + redirect.count, 0);
    const avgClicksPerRedirect = totalRedirects > 0
        ? (totalClicks / totalRedirects).toFixed(1)
        : '0';

    // Aktivste Weiterleitungen finden (Top 3)
    const topRedirects = [...redirects]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{totalRedirects}</div>
                        <p className="text-muted-foreground">Aktive Weiterleitungen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{totalClicks}</div>
                        <p className="text-muted-foreground">Gesamtaufrufe</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{avgClicksPerRedirect}</div>
                        <p className="text-muted-foreground">⌀ Aufrufe pro Weiterleitung</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Weiterleitungen</CardTitle>
                    <CardDescription>Die am häufigsten genutzten Weiterleitungen</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topRedirects.map((redirect) => (
                            <div key={redirect.code} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{redirect.empfehlungsgeber}</p>
                                    <p className="text-sm text-muted-foreground">AM ID: {redirect.am_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{redirect.count} Aufrufe</p>
                                    <p className="text-sm text-muted-foreground">
                                        Zuletzt: {new Date(redirect.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 