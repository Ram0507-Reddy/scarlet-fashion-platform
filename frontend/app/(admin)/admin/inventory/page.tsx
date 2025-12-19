'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product';
import { Loader2, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export default function AdminInventoryPage() {
    const queryClient = useQueryClient();
    const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

    const { data: productsRes, isLoading } = useQuery({
        queryKey: ['admin-inventory'],
        queryFn: () => productService.getAll()
    });

    const products = productsRes?.data || [];

    const handleStockChange = (productId: string, size: string, newVal: string) => {
        const val = parseInt(newVal);
        if (!isNaN(val)) {
            setStockUpdates(prev => ({
                ...prev,
                [`${productId}-${size}`]: val
            }));
        }
    };

    const saveUpdates = async () => {
        // Mock save logic
        // const updates = Object.entries(stockUpdates).map(([key, val]) => {
        //    const [pid, size] = key.split('-');
        //    return { pid, size, val };
        // });

        // In real app, call mutation
        alert('Stock updates saved (Mock)');
        setStockUpdates({});
        queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    };

    if (isLoading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <button
                    onClick={saveUpdates}
                    disabled={Object.keys(stockUpdates).length === 0}
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Size Variant</th>
                            <th className="px-4 py-3">Current Stock</th>
                            <th className="px-4 py-3">New Stock</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map(product => {
                            return product.sizes.map((sizeVariant, idx) => {
                                const uniqueKey = `${product.id}-${sizeVariant.size}`;
                                const updatedVal = stockUpdates[uniqueKey];
                                const displayStock = updatedVal !== undefined ? updatedVal : sizeVariant.stock;
                                const isLow = displayStock < 5;

                                return (
                                    <tr key={uniqueKey} className={cn("hover:bg-secondary/20 transition-colors", isLow && "bg-red-50/50")}>
                                        {idx === 0 && (
                                            <td className="px-4 py-3 border-r border-border/50" rowSpan={product.sizes.length}>
                                                <div className="flex items-center space-x-3">
                                                    <img src={product.images[0]} className="w-8 h-8 rounded object-cover" />
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                        )}
                                        {idx === 0 && (
                                            <td className="px-4 py-3 border-r border-border/50" rowSpan={product.sizes.length}>{product.category}</td>
                                        )}
                                        <td className="px-4 py-3 font-medium bg-gray-50/50 w-24 text-center">{sizeVariant.size}</td>
                                        <td className="px-4 py-3 w-32">{sizeVariant.stock}</td>
                                        <td className="px-4 py-3 w-32">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-20 p-1 border rounded text-center"
                                                value={displayStock}
                                                onChange={(e) => handleStockChange(product.id, sizeVariant.size, e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {isLow ? (
                                                <span className="text-red-600 flex items-center text-xs font-medium">
                                                    <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="text-green-600 text-xs font-medium">In Stock</span>
                                            )}
                                            {updatedVal !== undefined && <span className="text-xs text-blue-600 ml-2">(Modified)</span>}
                                        </td>
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
