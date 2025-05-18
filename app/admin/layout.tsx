'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState('');
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken && !isLoginPage) {
            router.push('/admin/login');
            return;
        }
        setToken(storedToken || '');
    }, [router, isLoginPage]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!token) {
        return null;
    }

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            current: pathname === '/admin'
        },
        {
            name: 'API Docs',
            href: '/admin/docs',
            icon: BookOpen,
            current: pathname === '/admin/docs'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-4 border-b">
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Button
                                key={item.name}
                                variant={item.current ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-2",
                                    item.current && "bg-accent"
                                )}
                                onClick={() => router.push(item.href)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Button>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            Abmelden
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                <main className="container mx-auto py-8 px-4">
                    {children}
                </main>
            </div>
        </div>
    );
} 