'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { CustomerStats } from '@/components/admin/customer-stats';
import { Badge } from '@/components/ui/badge';
import { CustomerStatsSkeleton } from '@/components/admin/customer-stats-skeleton';
import { CustomerTableSkeleton } from '@/components/admin/customer-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageLayout } from '../../components/admin-page-layout';

// Typdefinitionen
type Customer = {
    id: string;
    formId: string;
    createdAt: string;
    redirects: Redirect[];
};

type Redirect = {
    am_id: string;
    customerId: string;
    empfehlungsgeber: string;
    createdAt: string;
    updatedAt: string;
    count: number;
};

interface CustomerDetailClientProps {
    id: string;
}

export function CustomerDetailClient({ id }: CustomerDetailClientProps) {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editFormId, setEditFormId] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Formularfelder für neue Weiterleitung
    const [am_id, setAmId] = useState('');
    const [empfehlungsgeber, setEmpfehlungsgeber] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Token aus localStorage holen
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken) {
            router.push('/admin/login');
            return;
        }
        setToken(storedToken);
    }, [router]);

    // Kundendetails laden
    useEffect(() => {
        if (!token) return;

        async function loadCustomer() {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/customer/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('adminToken');
                        router.push('/admin/login');
                        toast.error('Nicht autorisiert');
                    } else if (response.status === 404) {
                        toast.error('Kunde nicht gefunden');
                        router.push('/admin');
                    } else {
                        toast.error('Fehler beim Laden des Kunden');
                    }
                    return;
                }

                const data = await response.json();
                setCustomer(data);
            } catch (error) {
                console.error('Fehler beim Laden des Kunden:', error);
                toast.error('Fehler beim Laden des Kunden');
            } finally {
                setLoading(false);
            }
        }

        loadCustomer();
    }, [id, token, router]);

    // Weiterleitung löschen
    const deleteRedirect = async (am_id: string) => {
        if (!customer) return;

        if (!confirm('Möchten Sie diese Weiterleitung wirklich löschen?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/redirect/${customer.id}/${am_id}`, {
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
                    toast.error('Fehler beim Löschen der Weiterleitung');
                }
                return;
            }

            // Aktualisiere die Kundendaten
            const customerResponse = await fetch(`/api/admin/customer/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (customerResponse.ok) {
                const data = await customerResponse.json();
                setCustomer(data);
                toast.success('Weiterleitung erfolgreich gelöscht');
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Weiterleitung:', error);
            toast.error('Fehler beim Löschen der Weiterleitung');
        }
    };

    // Neue Weiterleitung erstellen
    const createRedirect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        setFormSubmitting(true);

        try {
            const response = await fetch('/api/admin/redirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    am_id,
                    empfehlungsgeber
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Nicht autorisiert');
                    router.push('/admin');
                } else {
                    const data = await response.json();
                    toast.error(data.error || 'Fehler beim Erstellen der Weiterleitung');
                }
                return;
            }

            // Aktualisiere die Kundendaten
            const customerResponse = await fetch(`/api/admin/customer/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (customerResponse.ok) {
                const data = await customerResponse.json();
                setCustomer(data);
                setAmId('');
                setEmpfehlungsgeber('');
                setIsCreateDialogOpen(false);
                toast.success('Weiterleitung erfolgreich erstellt');
            }
        } catch (error) {
            console.error('Fehler beim Erstellen der Weiterleitung:', error);
            toast.error('Fehler beim Erstellen der Weiterleitung');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Kunde bearbeiten
    const editCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        setIsEditing(true);

        try {
            const response = await fetch(`/api/admin/customer/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    formId: editFormId
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Nicht autorisiert');
                    router.push('/admin');
                } else {
                    toast.error('Fehler beim Aktualisieren des Kunden');
                }
                return;
            }

            // Aktualisiere die Kundendaten
            const customerResponse = await fetch(`/api/admin/customer/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (customerResponse.ok) {
                const data = await customerResponse.json();
                setCustomer(data);
                setIsEditDialogOpen(false);
                toast.success('Kunde erfolgreich aktualisiert');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Kunden:', error);
            toast.error('Fehler beim Aktualisieren des Kunden');
        } finally {
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (customer && isEditDialogOpen) {
            setEditFormId(customer.formId);
        }
    }, [customer, isEditDialogOpen]);

    if (!token) {
        return null; // Sollte zur Admin-Seite weitergeleitet werden
    }

    if (loading) {
        return (
            <AdminPageLayout
                title="Kunde wird geladen..."
                subtitle="Die Kundeninformationen werden geladen"
            >
                <div className="space-y-6">
                    <CustomerStatsSkeleton />
                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CustomerTableSkeleton />
                        </CardContent>
                    </Card>
                </div>
            </AdminPageLayout>
        );
    }

    if (!customer) {
        return (
            <AdminPageLayout
                title="Kunde nicht gefunden"
                subtitle="Der gesuchte Kunde existiert nicht oder Sie haben keine Berechtigung"
            >
                <div className="space-y-6">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <p className="text-muted-foreground mb-4">Keine Kundendaten verfügbar</p>
                            <Button onClick={() => router.push('/admin')}>
                                Zurück zur Übersicht
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title={'Kundendetails'}
            subtitle={`Kundendetails und Weiterleitungen - Erstellt am ${new Date(customer.createdAt).toLocaleDateString()}`}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Kundeninformationen</CardTitle>
                            <CardDescription>Details zum Kunden {customer.id}</CardDescription>
                        </div>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Kunde bearbeiten</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Kunde bearbeiten</DialogTitle>
                                    <DialogDescription>
                                        Bearbeiten Sie die Details für den Kunden {customer.id}.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={editCustomer} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editFormId">Form-ID</Label>
                                        <Input
                                            id="editFormId"
                                            value={editFormId}
                                            onChange={(e) => setEditFormId(e.target.value)}
                                            placeholder="z.B. abc123"
                                            disabled={isEditing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Die Form-ID für das LeadConnector-Formular.
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={isEditing}>
                                            {isEditing ? 'Wird aktualisiert...' : 'Kunde aktualisieren'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kunden-ID</p>
                                <p className="font-medium">{customer.id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Form-ID</p>
                                <p className="font-medium">{customer.formId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Erstellt am</p>
                                <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CustomerStats redirects={customer.redirects} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Weiterleitungen</CardTitle>
                            <CardDescription>Alle Weiterleitungen für diesen Kunden</CardDescription>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Neue Weiterleitung</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Neue Weiterleitung erstellen</DialogTitle>
                                    <DialogDescription>
                                        Erstellen Sie eine neue Weiterleitung für den Kunden {customer.id}.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={createRedirect} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="am_id">AM ID</Label>
                                        <Input
                                            id="am_id"
                                            value={am_id}
                                            onChange={(e) => setAmId(e.target.value)}
                                            placeholder="z.B. 12345"
                                            disabled={formSubmitting}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Die AM ID wird als Code in der Weiterleitungs-URL verwendet.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="empfehlungsgeber">Empfehlungsgeber</Label>
                                        <Input
                                            id="empfehlungsgeber"
                                            value={empfehlungsgeber}
                                            onChange={(e) => setEmpfehlungsgeber(e.target.value)}
                                            placeholder="z.B. Max Mustermann"
                                            disabled={formSubmitting}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={formSubmitting}>
                                            {formSubmitting ? 'Wird erstellt...' : 'Weiterleitung erstellen'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {customer.redirects.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground mb-4">Keine Weiterleitungen gefunden.</p>
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    Erste Weiterleitung erstellen
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>AM ID</TableHead>
                                        <TableHead>Empfehlungsgeber</TableHead>
                                        <TableHead>Erstellt am</TableHead>
                                        <TableHead>Zuletzt verwendet</TableHead>
                                        <TableHead>Aufrufe</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customer.redirects.map((redirect) => (
                                        <TableRow key={redirect.am_id}>
                                            <TableCell>{redirect.am_id}</TableCell>
                                            <TableCell>{redirect.empfehlungsgeber}</TableCell>
                                            <TableCell>{new Date(redirect.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(redirect.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{redirect.count}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                <a
                                                    href={`/${customer.id}/${redirect.am_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    /{customer.id}/{redirect.am_id}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deleteRedirect(redirect.am_id)}
                                                >
                                                    Löschen
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageLayout>
    );
} 