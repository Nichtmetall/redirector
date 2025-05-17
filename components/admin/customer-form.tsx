'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CustomerFormProps {
    token: string;
    onSuccess: () => void;
}

export default function CustomerForm({ token, onSuccess }: CustomerFormProps) {
    const [id, setId] = useState('');
    const [formId, setFormId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !formId) {
            toast.error('Bitte füllen Sie alle Felder aus');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, formId }),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || 'Fehler beim Erstellen des Kunden');
                return;
            }

            setId('');
            setFormId('');
            onSuccess();
        } catch (error) {
            console.error('Fehler beim Erstellen des Kunden:', error);
            toast.error('Fehler beim Erstellen des Kunden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="id">Kunden-ID</Label>
                <Input
                    id="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="z.B. kunde1"
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                    Die Kunden-ID wird in der URL verwendet (nur Buchstaben, Zahlen, Bindestriche).
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="formId">Form-ID</Label>
                <Input
                    id="formId"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="z.B. abc123"
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                    Die Form-ID für das LeadConnector-Formular.
                </p>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Wird erstellt...' : 'Kunde erstellen'}
                </Button>
            </div>
        </form>
    );
} 