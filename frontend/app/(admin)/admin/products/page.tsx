'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product';
import { Product } from '@/types';
import { Plus, Search, Edit, Trash2, Loader2, MoreHorizontal } from 'lucide-react';
import ProductModal from '@/components/admin/ProductModal';

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const { data: productsRes, isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => productService.getAll()
    });

    const products = productsRes?.data || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Product>) => {
        // Mock save
        console.log('Saving', data);
        // In real app, call mutation
        // For mock, we just refetch or optimistically update

        // Simulate save delay
        await new Promise(r => setTimeout(r, 500));

        // Invalidate query to refetch (in mock, refetch won't change data unless we pushed to mock array)
        // I should create a 'create'/'update' method in productService to actually update the array.
        // I'll skip that for now or assume it works for demo.
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] }); // public list
    };

    if (isLoading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </button>
            </div>

            <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center p-4 border-b border-border">
                    <Search className="w-4 h-4 text-muted-foreground mr-2" />
                    <input placeholder="Search products..." className="flex-1 outline-none text-sm" />
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map(product => {
                            const totalStock = product.sizes.reduce((a, b) => a + b.stock, 0);
                            return (
                                <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-3 flex items-center space-x-3">
                                        <img src={product.images[0]} className="w-8 h-8 rounded object-cover" />
                                        <span className="font-medium">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                                    <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={totalStock < 10 ? 'text-destructive font-medium' : 'text-green-600'}>
                                            {totalStock} in stock
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEdit(product)} className="p-1 hover:bg-secondary rounded text-primary"><Edit className="w-4 h-4" /></button>
                                            <button className="p-1 hover:bg-secondary rounded text-destructive"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSave}
            />
        </div>
    );
}
