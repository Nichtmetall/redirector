'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import CustomerForm from './customer-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ApiEndpoints } from './api-endpoints';
import { DashboardStats } from './dashboard-stats';

// Typdefinitionen
type Customer = {
    id: string;
    formId: string;
    createdAt: string;
    _count?: {
        redirects: number;
    };
};

export default function AdminDashboard() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
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

    // Kunden laden
    const loadCustomers = useCallback(async () => {
        if (!token) return;

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
                    toast.error('Nicht autorisiert. Bitte erneut anmelden.');
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
    }, [token, router]);

    useEffect(() => {
        if (token) {
            loadCustomers();
        }
    }, [token, loadCustomers]);

    // Kunde löschen
    const deleteCustomer = async (id: string) => {
        if (!token) return;

        if (!confirm('Möchten Sie diesen Kunden wirklich löschen? Alle zugehörigen Weiterleitungen werden ebenfalls gelöscht.')) {
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
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                    toast.error('Nicht autorisiert. Bitte erneut anmelden.');
                } else {
                    toast.error('Fehler beim Löschen des Kunden');
                }
                return;
            }

            toast.success('Kunde erfolgreich gelöscht');
            loadCustomers();
        } catch (error) {
            console.error('Fehler beim Löschen des Kunden:', error);
            toast.error('Fehler beim Löschen des Kunden');
        }
    };

    const handleCustomerCreated = () => {
        setIsCreateDialogOpen(false);
        loadCustomers();
        toast.success('Kunde erfolgreich erstellt');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        toast.success('Erfolgreich abgemeldet');
    };

    if (!token) {
        return null; // Wird während der Weiterleitung angezeigt
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin-Dashboard</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleLogout}>
                        Abmelden
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Neuen Kunden anlegen</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Neuen Kunden anlegen</DialogTitle>
                                <DialogDescription>
                                    Erstellen Sie einen neuen Kunden mit ID und Form-ID.
                                </DialogDescription>
                            </DialogHeader>
                            <CustomerForm token={token} onSuccess={handleCustomerCreated} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!loading && <DashboardStats customers={customers} />}

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Kundenübersicht</CardTitle>
                    <CardDescription>
                        Alle verfügbaren Kunden und deren Weiterleitungen
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Laden...</p>
                    ) : customers.length === 0 ? (
                        <p>Keine Kunden gefunden. Erstellen Sie einen neuen Kunden.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kunden-ID</TableHead>
                                    <TableHead>Form-ID</TableHead>
                                    <TableHead>Erstellt am</TableHead>
                                    <TableHead>Weiterleitungen</TableHead>
                                    <TableHead>Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.id}</TableCell>
                                        <TableCell>{customer.formId}</TableCell>
                                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{customer._count?.redirects || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/customer/${customer.id}`}>Details</Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
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

            <ApiEndpoints />
        </div>
    );
} 