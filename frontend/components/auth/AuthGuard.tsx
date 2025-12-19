'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: ('USER' | 'ADMIN')[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        // Wait for hydration (persist store)
        // In zustand persist, we might need to check if hydrated, but usually logic runs after mount.
        // We simulate hydration check or just run effect.

        if (!isAuthenticated) {
            router.push('/login');
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Role mismatch
            if (user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/shop');
            }
        } else {
            setIsChecked(true);
        }
    }, [isAuthenticated, user, router, allowedRoles]);

    if (!isAuthenticated || !isChecked) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
