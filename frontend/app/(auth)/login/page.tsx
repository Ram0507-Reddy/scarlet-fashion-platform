'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        try {
            const response = await authService.login(data.email, data.password);

            if (response.success && response.data) {
                login(response.data.user, response.data.token);

                // Role based redirect check
                if (response.data.user.role === 'ADMIN') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/shop');
                }
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">Welcome Back</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="email">Email</label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.email ? "border-destructive" : "border-input"
                        )}
                        placeholder="user@example.com"
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium" htmlFor="password">Password</label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        {...register('password')}
                        type="password"
                        id="password"
                        className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.password ? "border-destructive" : "border-input"
                        )}
                        placeholder="••••••"
                    />
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                    Create Account
                </Link>
            </p>

            <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                <p>Demo Credentials:</p>
                <p>User: user@example.com / 123456</p>
                <p>Admin: admin@example.com / 123456</p>
            </div>
        </div>
    );
}
