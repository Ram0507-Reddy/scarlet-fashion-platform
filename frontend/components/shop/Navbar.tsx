'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const { getTotalItems } = useCartStore();
    const { toggleCart, toggleMobileMenu, isMobileMenuOpen, closeMobileMenu } = useUiStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const cartCount = getTotalItems();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 -ml-2 hover:bg-secondary rounded-full"
                    onClick={toggleMobileMenu}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Logo */}
                <Link href="/shop" className="mr-6 flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-widest">SCARLET</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href="/shop" className={cn("transition-colors hover:text-primary", pathname === '/shop' ? "text-primary" : "text-muted-foreground")}>
                        Shop
                    </Link>
                    <Link href="/shop?sort=new" className="transition-colors hover:text-primary text-muted-foreground">
                        New Arrivals
                    </Link>
                    <Link href="/shop?category=Dresses" className="transition-colors hover:text-primary text-muted-foreground">
                        Dresses
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <Link href="/search" className="hidden md:block p-2 text-muted-foreground hover:text-primary transition-colors">
                        <span className="sr-only">Search</span>
                        {/* Simple search placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </Link>

                    <button
                        className="relative p-2 text-foreground hover:text-primary transition-colors"
                        onClick={toggleCart}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                        <span className="sr-only">Cart</span>
                    </button>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                            </button>
                            {/* Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border shadow-lg rounded-md overflow-hidden py-1">
                                    <div className="px-4 py-2 border-b border-border">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-secondary">
                                        My Orders
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-secondary">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={closeMobileMenu}>
                    <div className="fixed inset-y-0 left-0 w-3/4 bg-white border-r border-border p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xl font-bold">SCARLET</span>
                            <button onClick={closeMobileMenu}><X className="w-5 h-5" /></button>
                        </div>
                        <nav className="flex flex-col space-y-4">
                            <Link href="/shop" onClick={closeMobileMenu} className="text-lg font-medium">Shop</Link>
                            <Link href="/shop?sort=new" onClick={closeMobileMenu} className="text-lg font-medium">New Arrivals</Link>
                            <Link href="/cart" onClick={closeMobileMenu} className="text-lg font-medium">Cart ({cartCount})</Link>
                            {!user ? (
                                <Link href="/login" onClick={closeMobileMenu} className="text-lg font-medium text-primary">Login</Link>
                            ) : (
                                <>
                                    <Link href="/orders" onClick={closeMobileMenu} className="text-lg font-medium">My Orders</Link>
                                    <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="text-lg font-medium text-destructive text-left">Logout</button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
