'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const subtotal = getSubtotal();
    const delivery = subtotal > 200 ? 0 : 15;
    const total = subtotal + delivery;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Link href="/shop" className="text-primary underline">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8 font-serif">Shopping Bag</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-6">
                    {items.map(item => (
                        <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-border pb-6">
                            <div className="w-24 h-32 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                <img src={item.product?.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{item.product?.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                                        <p className="text-sm font-medium mt-1">${item.product?.price}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.productId, item.size)} className="text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center mt-4 border border-input w-fit rounded-md">
                                    <button onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))} className="p-1 px-2 hover:bg-secondary">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-1 px-2 hover:bg-secondary">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-96">
                    <div className="bg-secondary/30 p-6 rounded-lg sticky top-24">
                        <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

                        <div className="space-y-4 text-sm mb-6 border-b border-border pb-6">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery</span>
                                <span>{delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg mb-6">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        {isAuthenticated ? (
                            <Link href="/checkout" className="block w-full bg-primary text-white text-center py-3 rounded-md font-medium hover:bg-primary/90 transition-colors uppercase tracking-wider">
                                Checkout
                            </Link>
                        ) : (
                            <Link href="/login" className="block w-full bg-black text-white text-center py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
                                Login to Checkout
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
