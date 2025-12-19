'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col">
                    <div className="p-6 border-b border-border">
                        <h1 className="text-xl font-bold text-primary">SCARLET ADMIN</h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/admin/dashboard" className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground">
                            Dashboard
                        </Link>
                        <Link href="/admin/products" className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
                            Products
                        </Link>
                        <Link href="/admin/orders" className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50">
                            Orders
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-border">
                        <Link href="/logout" className="text-sm text-destructive hover:underline">Logout</Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
