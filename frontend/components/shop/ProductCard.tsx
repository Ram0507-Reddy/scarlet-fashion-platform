'use client';

import { Product } from '@/types';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();

    const hasStock = product.sizes.some(s => s.stock > 0);
    const minPrice = product.price; // Simplified

    // Simple add to cart default (e.g. first available size)
    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!hasStock) return;
        const firstSize = product.sizes.find(s => s.stock > 0);
        if (firstSize) {
            addItem(product, firstSize.size, 1);
            // Maybe show toast here
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="group relative bg-white rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
        >
            <Link href={`/product/${product.slug}`} className="block">
                <div className="aspect-[3/4] overflow-hidden bg-secondary relative">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!hasStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">${product.price.toFixed(2)}</p>

                    <div className="mt-2 text-xs text-muted-foreground">
                        Sizes: {product.sizes.filter(s => s.stock > 0).map(s => s.size).join(', ')}
                    </div>
                </div>
            </Link>

            <button
                onClick={handleQuickAdd}
                disabled={!hasStock}
                className={cn(
                    "absolute bottom-20 right-4 p-3 rounded-full shadow-md translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300",
                    hasStock ? "bg-white text-primary hover:bg-primary hover:text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
                title="Quick Add"
            >
                <ShoppingBag className="w-5 h-5" />
            </button>
        </motion.div>
    );
}
