'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <Skeleton className="h-7 w-[60px] mb-1" />
                        <Skeleton className="h-4 w-[120px]" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <Skeleton className="h-7 w-[60px] mb-1" />
                        <Skeleton className="h-4 w-[120px]" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <Skeleton className="h-7 w-[60px] mb-1" />
                        <Skeleton className="h-4 w-[120px]" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-[150px]" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-[250px]" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-[100px]" />
                                            <Skeleton className="h-8 w-[80px]" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 