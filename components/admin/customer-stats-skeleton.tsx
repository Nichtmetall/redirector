'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomerStatsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-[100px]" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-[150px]" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-[250px]" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-5 w-[150px] mb-2" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                                <div className="text-right">
                                    <Skeleton className="h-5 w-[80px] mb-2" />
                                    <Skeleton className="h-4 w-[120px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 