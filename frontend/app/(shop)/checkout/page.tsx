'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldCheck, Truck } from 'lucide-react';
import { orderService } from '@/services/order';
import { cn } from '@/utils/cn';

const addressSchema = z.object({
    fullName: z.string().min(2),
    street: z.string().min(5),
    city: z.string().min(2),
    zipCode: z.string().min(4),
    phone: z.string().min(10),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
    const { items, getSubtotal, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [address, setAddress] = useState<AddressFormData | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('UPI');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Redirect if empty cart or not auth
    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (items.length === 0) router.push('/cart');
    }, [isAuthenticated, items, router]);

    const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    const onAddressSubmit = (data: AddressFormData) => {
        setAddress(data);
        setStep(2);
    };

    const placeOrder = async () => {
        if (!user || !address) return;
        setIsPlacingOrder(true);

        const subtotal = getSubtotal();
        const delivery = subtotal > 200 ? 0 : 15;
        const total = subtotal + delivery;

        const formattedAddress = `${address.fullName}, ${address.street}, ${address.city}, ${address.zipCode}. Phone: ${address.phone}`;

        const orderItems = items.map(i => ({
            productId: i.productId,
            productName: i.product?.name || 'Unknown',
            productImage: i.product?.images[0] || '',
            size: i.size,
            quantity: i.quantity,
            price: i.product?.price || 0
        }));

        try {
            const res = await orderService.create(user.id, orderItems, total, formattedAddress, paymentMethod);
            if (res.success) {
                clearCart();
                router.push('/orders'); // Or success page
            }
        } catch (err) {
            alert("Order failed");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (!isAuthenticated || items.length === 0) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-8 font-serif">Checkout</h1>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    {/* Step 1: Address */}
                    <div className={cn("p-6 rounded-lg border", step === 1 ? "bg-white border-primary/50 shadow-sm" : "bg-gray-50 border-border opacity-60")}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs mr-2">1</span>
                            Shipping Address
                        </h2>

                        {step === 1 ? (
                            <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input {...register('fullName')} placeholder="Full Name" className="p-2 border rounded-md w-full" />
                                    <input {...register('phone')} placeholder="Phone Number" className="p-2 border rounded-md w-full" />
                                </div>
                                <input {...register('street')} placeholder="Street Address" className="p-2 border rounded-md w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input {...register('city')} placeholder="City" className="p-2 border rounded-md w-full" />
                                    <input {...register('zipCode')} placeholder="Zip Code" className="p-2 border rounded-md w-full" />
                                </div>
                                {(errors.fullName || errors.street || errors.city || errors.zipCode || errors.phone) && (
                                    <div className="text-destructive text-sm">Please fill all fields</div>
                                )}
                                <button type="submit" className="bg-black text-white px-6 py-2 rounded-md">Continue</button>
                            </form>
                        ) : (
                            <div className="flex justify-between items-center text-sm">
                                <p>{address?.fullName}, {address?.city}</p>
                                <button onClick={() => setStep(1)} className="text-primary underline">Edit</button>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Payment */}
                    <div className={cn("p-6 rounded-lg border", step === 2 ? "bg-white border-primary/50 shadow-sm" : "bg-gray-50 border-border opacity-60")}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs mr-2">2</span>
                            Payment Method
                        </h2>

                        {step === 2 ? (
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-secondary">
                                    <input type="radio" name="payment" className="mr-3" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                                    <div className="flex-1">
                                        <span className="font-medium">UPI / QR Code</span>
                                        <p className="text-xs text-muted-foreground">Scan QR code to pay manually</p>
                                    </div>
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </label>

                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-secondary">
                                    <input type="radio" name="payment" className="mr-3" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                    <div className="flex-1">
                                        <span className="font-medium">Cash on Delivery</span>
                                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                                    </div>
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </label>

                                <button onClick={() => setStep(3)} className="bg-black text-white px-6 py-2 rounded-md mt-4">Review Order</button>
                            </div>
                        ) : (
                            step === 3 && <p className="text-sm">{paymentMethod === 'UPI' ? 'UPI Payment' : 'Cash on Delivery'}</p>
                        )}
                    </div>

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="bg-white p-6 rounded-lg border border-primary/50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-lg font-semibold mb-4">Confirm Order</h2>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.productId + item.size} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.product?.name} ({item.size})</span>
                                        <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Total to Pay</span>
                                    <span>${(getSubtotal() + (getSubtotal() > 200 ? 0 : 15)).toFixed(2)}</span>
                                </div>
                            </div>

                            {paymentMethod === 'UPI' && (
                                <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
                                    <p className="text-sm text-yellow-800 font-medium mb-2">⚠ Action Required</p>
                                    <p className="text-xs text-yellow-700">Since this is a manual UPI payment, please upload the screenshot after placing the order or contact support.</p>
                                    <div className="mt-2 h-24 w-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500 mx-auto border-2 border-dashed border-gray-400">
                                        QR Placeholder
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={placeOrder}
                                disabled={isPlacingOrder}
                                className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 flex items-center justify-center"
                            >
                                {isPlacingOrder && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Place Order
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="md:w-80 h-fit bg-secondary/30 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    {/* ... Repeated summary or keep it simple ... */}
                    <div className="flex justify-between mb-2 text-sm"><span>Items</span><span>${getSubtotal().toFixed(2)}</span></div>
                    <div className="flex justify-between mb-2 text-sm"><span>Delivery</span><span>${getSubtotal() > 200 ? '0.00' : '15.00'}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>${(getSubtotal() + (getSubtotal() > 200 ? 0 : 15)).toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
}
