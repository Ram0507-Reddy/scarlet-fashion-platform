'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order';
import { useAuthStore } from '@/store/authStore';
import { BadgeCheck, Clock, Package, Truck, XCircle, FileText, ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { cn } from '@/utils/cn';

const STATUS_MAP: Record<OrderStatus, { label: string; icon: LucideIcon; color: string }> = {
    'PENDING_PAYMENT': { label: 'Pending Payment', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    'PAID': { label: 'Paid', icon: BadgeCheck, color: 'text-green-600 bg-green-50 border-green-200' },
    'BILLED': { label: 'Billed', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    'SHIPPED': { label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    'CANCELLED': { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function OrdersPage() {
    const { user } = useAuthStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: ordersRes, isLoading } = useQuery({
        queryKey: ['my-orders', user?.id],
        queryFn: () => user ? orderService.getMyOrders(user.id) : Promise.resolve({ success: true, data: [] }),
        enabled: !!user,
    });

    const orders = ordersRes?.data || [];

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) return <div className="p-12 text-center">Loading orders...</div>;
    if (orders.length === 0) return <div className="p-12 text-center text-muted-foreground">No orders found.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-8 font-serif">My Orders</h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['PENDING_PAYMENT'];
                    const StatusIcon = statusInfo.icon;
                    const isExpanded = expandedId === order.id;

                    return (
                        <div key={order.id} className="bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div
                                className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer bg-secondary/10"
                                onClick={() => toggleExpand(order.id)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-semibold text-sm">{order.id}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={cn("px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1", statusInfo.color)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </div>
                                </div>

                                <div className="flex items-center mt-4 md:mt-0 space-x-6">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="p-4 border-t border-border bg-white animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Shipping Address</h4>
                                            <p className="text-sm">{order.shippingAddress}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Info</h4>
                                            <p className="text-sm">Method: {order.paymentMethod}</p>
                                            <p className="text-sm">Status: {order.status}</p>
                                        </div>
                                    </div>

                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Items</h4>
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover mr-3 bg-secondary" />
                                                    <span>{item.quantity}x {item.productName} <span className="text-muted-foreground">({item.size})</span></span>
                                                </div>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t mt-4 pt-4 flex justify-between items-center">
                                        <button className="text-primary text-sm hover:underline flex items-center">
                                            <FileText className="w-4 h-4 mr-1" /> Download Invoice
                                        </button>
                                        <div className="text-right font-bold">
                                            Total: ${order.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
