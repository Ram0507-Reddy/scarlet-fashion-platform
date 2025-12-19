'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order';
import { productService } from '@/services/product';
import { ShoppingCart, DollarSign, AlertTriangle, Package, Loader2 } from 'lucide-react';
import { Order } from '@/types';

export default function AdminDashboardPage() {
    const { data: ordersRes, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: orderService.getAllOrders
    });

    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => productService.getAll()
    });

    if (ordersLoading || productsLoading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    const orders = ordersRes?.data || [];
    const products = productsRes?.data || [];

    const totalRevenue = orders.reduce((acc, o) => o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT' ? acc + o.total : acc, 0);
    const pendingPayments = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
    const lowStockProducts = products.filter(p => p.sizes.some(s => s.stock < 5));

    const stats = [
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
        { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
        { label: 'Pending Payments', value: pendingPayments, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Low Stock Alerts', value: lowStockProducts.length, icon: Package, color: 'text-red-600 bg-red-50' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-lg border border-border shadow-sm flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-sm">{order.id}</p>
                                    <p className="text-xs text-muted-foreground">{order.items.length} items • {order.status}</p>
                                </div>
                                <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Low Stock Products</h2>
                    <div className="space-y-4">
                        {lowStockProducts.slice(0, 5).map(product => (
                            <div key={product.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-secondary rounded overflow-hidden">
                                        <img src={product.images[0]} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm truncate w-40">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Low on: {product.sizes.filter(s => s.stock < 5).map(s => `${s.size} (${s.stock})`).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-xs text-primary hover:underline">Manage</button>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && <p className="text-sm text-muted-foreground">Inventory looks good.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
