'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order';
import { Order, OrderStatus } from '@/types';
import { Clock, BadgeCheck, FileText, XCircle, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export default function AdminOrdersPage() {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: ordersRes, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: orderService.getAllOrders
    });

    const orders = ordersRes?.data || [];
    const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        await orderService.updateStatus(orderId, newStatus);
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        className="border rounded-md p-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="PAID">Paid</option>
                        <option value="BILLED">Billed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b bg-secondary/50 font-medium text-sm text-muted-foreground">
                    <div className="col-span-1">Order ID</div>
                    <div className="col-span-1">Customer</div>
                    <div className="col-span-1">Total</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <div>
                    {filteredOrders.length === 0 && <div className="p-8 text-center text-muted-foreground">No orders found.</div>}

                    {filteredOrders.map(order => (
                        <div key={order.id} className="border-b last:border-0">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 items-center">
                                <div className="font-medium">{order.id}</div>
                                <div className="text-sm truncate" title={order.userId}>{order.shippingAddress.split(',')[0]}</div>
                                <div className="font-medium">${order.total.toFixed(2)}</div>
                                <div>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        order.status === 'PAID' ? "bg-green-100 text-green-800" :
                                            order.status === 'PENDING_PAYMENT' ? "bg-yellow-100 text-yellow-800" :
                                                "bg-gray-100 text-gray-800"
                                    )}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => toggleExpand(order.id)} className="p-1 hover:bg-secondary rounded">
                                        {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {expandedId === order.id && (
                                <div className="bg-secondary/10 p-4 border-t border-dashed">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-medium text-sm mb-2">Order Items</h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-sm text-muted-foreground">
                                                    {item.quantity}x {item.productName} ({item.size})
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {order.status === 'PENDING_PAYMENT' && (
                                                <button onClick={() => handleStatusUpdate(order.id, 'PAID')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                                    Mark as PAID
                                                </button>
                                            )}
                                            {order.status === 'PAID' && (
                                                <button onClick={() => handleStatusUpdate(order.id, 'BILLED')} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                                    Generate Bill
                                                </button>
                                            )}
                                            {order.status === 'BILLED' && (
                                                <button onClick={() => handleStatusUpdate(order.id, 'SHIPPED')} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                                                    Mark Shipped
                                                </button>
                                            )}
                                            <button onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="text-xs border border-destructive text-destructive px-3 py-1 rounded hover:bg-destructive/10">
                                                Cancel Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
