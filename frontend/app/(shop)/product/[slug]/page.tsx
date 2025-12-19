'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Loader2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export default function ProductDetailsPage() {
    const { slug } = useParams() as { slug: string };
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();

    const { data: productResponse, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => productService.getBySlug(slug)
    });

    const product = productResponse?.data;

    if (isLoading) {
        return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!product) {
        return <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
            <h2 className="text-xl mb-4">Product not found</h2>
            <Link href="/shop" className="text-primary hover:underline flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop</Link>
        </div>;
    }

    const selectedSizeInfo = product.sizes.find(s => s.size === selectedSize);
    const maxStock = selectedSizeInfo?.stock || 0;
    const isOutOfStock = product.sizes.every(s => s.stock === 0);

    const handleAddToCart = () => {
        if (!selectedSize) return;
        addItem(product, selectedSize, quantity);
        // Ideally use a toast here
        alert("Added to cart!");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery (Simplified) */}
                <div className="space-y-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    {/* If multiple images, thumbnails go here */}
                </div>

                {/* Details */}
                <div>
                    <div className="mb-2 text-primary font-medium">{product.category}</div>
                    <h1 className="text-3xl font-bold font-serif mb-2">{product.name}</h1>
                    <p className="text-2xl mb-6">${product.price.toFixed(2)}</p>

                    <div className="prose text-muted-foreground mb-8">
                        <p>{product.description}</p>
                    </div>

                    {/* Size Selector */}
                    <div className="mb-8">
                        <h3 className="font-medium mb-3">Select Size</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map(sizeInfo => {
                                const isSizeOutOfStock = sizeInfo.stock === 0;
                                return (
                                    <button
                                        key={sizeInfo.size}
                                        disabled={isSizeOutOfStock}
                                        onClick={() => { setSelectedSize(sizeInfo.size); setQuantity(1); }}
                                        className={cn(
                                            "w-12 h-12 rounded-full border border-border flex items-center justify-center transition-all",
                                            isSizeOutOfStock ? "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed line-through" :
                                                selectedSize === sizeInfo.size ? "bg-black text-white border-black" : "hover:border-black"
                                        )}
                                    >
                                        {sizeInfo.size}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedSizeInfo && selectedSizeInfo.stock < 5 && (
                            <p className="text-destructive text-sm mt-2">Only {selectedSizeInfo.stock} left!</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mb-8">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded-md">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 hover:bg-secondary disabled:opacity-50"
                                disabled={!selectedSize}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                                className="p-3 hover:bg-secondary disabled:opacity-50"
                                disabled={!selectedSize || quantity >= maxStock}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize || maxStock === 0}
                            className="flex-1 bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wider"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            {maxStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>

                    <div className="border-t border-border pt-6 text-sm text-muted-foreground">
                        <p>Free delivery on orders over $200</p>
                        <p className="mt-2">30-day return policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
