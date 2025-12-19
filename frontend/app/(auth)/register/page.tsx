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

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setError(null);
        try {
            const response = await authService.register(data.email, data.password, data.name);

            if (response.success && response.data) {
                login(response.data.user, response.data.token);
                router.push('/shop'); // New users go to shop
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-center">Create Account</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                    <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.name ? "border-destructive" : "border-input"
                        )}
                        placeholder="Jane Doe"
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                </div>

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
                    <label className="text-sm font-medium" htmlFor="password">Password</label>
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
                    <p className="text-[10px] text-muted-foreground">Min 6 chars, 1 uppercase, 1 number</p>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        id="confirmPassword"
                        className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.confirmPassword ? "border-destructive" : "border-input"
                        )}
                        placeholder="••••••"
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center mt-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Create Account
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
