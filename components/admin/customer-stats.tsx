'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Redirect {
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
    const averageClicks = totalRedirects > 0 ? Math.round(totalClicks / totalRedirects) : 0;

    // Top 5 Weiterleitungen nach Aufrufen
    const topRedirects = [...redirects]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Weiterleitungen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRedirects}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Gesamtaufrufe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Durchschnittliche Aufrufe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageClicks}</div>
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
                            <div key={redirect.am_id} className="flex items-center justify-between">
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