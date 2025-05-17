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

// Typdefinitionen
type Customer = {
    id: string;
    formId: string;
    createdAt: string;
    redirects: Redirect[];
};

type Redirect = {
    code: string;
    customerId: string;
    am_id: string;
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
    const deleteRedirect = async (code: string) => {
        if (!customer) return;

        if (!confirm('Möchten Sie diese Weiterleitung wirklich löschen?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/redirect/${customer.id}/${code}`, {
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
            // Generiere einen eindeutigen Code basierend auf der am_id
            const code = `${am_id}-${Date.now()}`;

            const response = await fetch('/api/admin/redirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    code,
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

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                    <Button variant="outline" asChild className="mb-2">
                        <Link href="/admin">&larr; Zurück zum Dashboard</Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Kundendetails</h1>
                    {!loading && customer && (
                        <p className="text-muted-foreground">
                            Verwalten Sie die Details und Weiterleitungen für {customer.id}
                        </p>
                    )}
                </div>

                {!loading && customer && (
                    <div className="flex gap-2">
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

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Neue Weiterleitung erstellen</Button>
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
                    </div>
                )}
            </div>

            {loading ? (
                <p>Laden...</p>
            ) : !customer ? (
                <p>Kunde nicht gefunden.</p>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kundeninformationen</CardTitle>
                            <CardDescription>Details zum Kunden {customer.id}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={customer.redirects.length > 0 ? "success" : "secondary"}>
                                        {customer.redirects.length > 0 ? 'Aktiv' : 'Inaktiv'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <CustomerStats redirects={customer.redirects} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Weiterleitungen</CardTitle>
                            <CardDescription>
                                Alle Weiterleitungen für diesen Kunden
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {customer.redirects.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground mb-4">Keine Weiterleitungen gefunden.</p>
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>Erste Weiterleitung erstellen</Button>
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
                                            <TableRow key={redirect.code}>
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
                                                        onClick={() => deleteRedirect(redirect.code)}
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
            )}
        </div>
    );
} 