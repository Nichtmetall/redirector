'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import CustomerForm from '@/components/admin/customer-form';
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton';
import { BookOpen } from 'lucide-react';
import { AdminPageLayout } from './components/admin-page-layout';

// Typdefinitionen
type Customer = {
    id: string;
    formId: string;
    createdAt: string;
    redirects: Redirect[];
};

type Redirect = {
    am_id: string;
    empfehlungsgeber: string;
    createdAt: string;
    updatedAt: string;
    count: number;
};

export default function AdminPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Token aus localStorage holen
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken) {
            router.push('/admin/login');
            return;
        }
        setToken(storedToken);
    }, [router]);

    // Kundenliste laden
    useEffect(() => {
        if (!token) return;

        async function loadCustomers() {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/customer', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('adminToken');
                        router.push('/admin/login');
                        toast.error('Nicht autorisiert');
                    } else {
                        toast.error('Fehler beim Laden der Kunden');
                    }
                    return;
                }

                const data = await response.json();
                setCustomers(data);
            } catch (error) {
                console.error('Fehler beim Laden der Kunden:', error);
                toast.error('Fehler beim Laden der Kunden');
            } finally {
                setLoading(false);
            }
        }

        loadCustomers();
    }, [token, router]);

    // Kunde löschen
    const deleteCustomer = async (id: string) => {
        if (!confirm('Möchten Sie diesen Kunden wirklich löschen? Alle Weiterleitungen werden ebenfalls gelöscht.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/customer/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Nicht autorisiert');
                    router.push('/admin');
                } else {
                    toast.error('Fehler beim Löschen des Kunden');
                }
                return;
            }

            setCustomers(customers.filter(customer => customer.id !== id));
            toast.success('Kunde erfolgreich gelöscht');
        } catch (error) {
            console.error('Fehler beim Löschen des Kunden:', error);
            toast.error('Fehler beim Löschen des Kunden');
        }
    };

    // Erfolgshandler für das Erstellen eines neuen Kunden
    const handleCreateSuccess = async () => {
        try {
            const response = await fetch('/api/admin/customer', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
                setIsCreateDialogOpen(false);
                toast.success('Kunde erfolgreich erstellt');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Kundenliste:', error);
        }
    };

    if (!token) {
        return null; // Sollte zur Login-Seite weitergeleitet werden
    }

    // Statistiken berechnen
    const calculateStats = (customers: Customer[]) => {
        if (!customers || customers.length === 0) {
            return {
                totalCustomers: 0,
                totalRedirects: 0,
                totalClicks: 0
            };
        }

        return {
            totalCustomers: customers.length,
            totalRedirects: customers.reduce((sum, customer) =>
                sum + (customer.redirects?.length || 0), 0),
            totalClicks: customers.reduce((sum, customer) =>
                sum + (customer.redirects?.reduce((sum, redirect) =>
                    sum + (redirect.count || 0), 0) || 0), 0)
        };
    };

    const stats = calculateStats(customers);

    return (
        <AdminPageLayout
            title="Dashboard"
            subtitle="Übersicht aller Kunden und Weiterleitungen"
        >
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                                <p className="text-muted-foreground">Kunden</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{stats.totalRedirects}</div>
                                <p className="text-muted-foreground">Weiterleitungen</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{stats.totalClicks}</div>
                                <p className="text-muted-foreground">Gesamtaufrufe</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Kunden</CardTitle>
                                <CardDescription>Verwalten Sie hier Ihre Kunden und deren Weiterleitungen</CardDescription>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>Neuen Kunden erstellen</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Neuen Kunden erstellen</DialogTitle>
                                    </DialogHeader>
                                    <CustomerForm token={token} onSuccess={handleCreateSuccess} />
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {!customers || customers.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Keine Kunden gefunden
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kunden-ID</TableHead>
                                            <TableHead>Form-ID</TableHead>
                                            <TableHead>Erstellt am</TableHead>
                                            <TableHead>Aktionen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer) => (
                                            <TableRow key={customer.id}>
                                                <TableCell>{customer.id}</TableCell>
                                                <TableCell>{customer.formId}</TableCell>
                                                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => router.push(`/admin/customer/${customer.id}`)}
                                                        >
                                                            Details
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => deleteCustomer(customer.id)}
                                                        >
                                                            Löschen
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push('/admin/docs')}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-2">
                                    <BookOpen className="h-8 w-8" />
                                    <div>
                                        <div className="text-2xl font-bold">API</div>
                                        <p className="text-muted-foreground">Dokumentation</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
} 