'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToken, setShowToken] = useState(false);

    // Prüfe ob bereits ein Token im localStorage existiert
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
            router.push('/admin');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Teste das Token mit einem API-Aufruf
            const response = await fetch('/api/admin/customer', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Ungültiges Token');
                } else {
                    toast.error('Fehler bei der Authentifizierung');
                }
                return;
            }

            // Token ist gültig
            localStorage.setItem('adminToken', token);
            router.push('/admin');
            toast.success('Erfolgreich angemeldet');
        } catch (error) {
            console.error('Fehler bei der Authentifizierung:', error);
            toast.error('Fehler bei der Authentifizierung');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Admin-Login</CardTitle>
                    <CardDescription>
                        Bitte geben Sie Ihr Admin-Token ein
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">Admin-Token</Label>
                            <div className="relative">
                                <Input
                                    id="token"
                                    type={showToken ? "text" : "password"}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Ihr Admin-Token"
                                    disabled={loading}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowToken(!showToken)}
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button asChild variant="outline">
                                <Link href="/">Zurück zur Startseite</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Wird geprüft...' : 'Anmelden'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 