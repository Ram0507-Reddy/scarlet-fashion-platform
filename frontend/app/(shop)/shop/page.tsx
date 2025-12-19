'use client';

import { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product';
import ProductCard from '@/components/shop/ProductCard';
import { Loader2, Filter, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

function ShopPageLoader() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar Placeholder */}
                <aside className="md:w-64 flex-shrink-0 space-y-6 animate-pulse">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                    </div>
                </aside>

                {/* Product Grid Placeholder */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6 animate-pulse">
                        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded hidden md:block"></div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-4 animate-pulse">
                                <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryParam = searchParams.get('category') || 'All';
    const sortParam = searchParams.get('sort') || 'newest';

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', categoryParam, sortParam],
        queryFn: () => productService.getAll(categoryParam, sortParam)
    });

    const products = productsData?.data || [];

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'All') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar (Mobile Hidden / Toggle) */}
                <aside className={cn(
                    "md:w-64 flex-shrink-0 space-y-6",
                    "fixed md:relative inset-0 z-40 bg-white p-6 md:p-0 transition-transform md:translate-x-0 transform",
                    isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <div className="flex justify-between items-center md:hidden mb-4">
                        <h2 className="font-bold text-lg">Filters</h2>
                        <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5" /></button>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Category</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {['All', 'Dresses', 'Tops', 'Bottoms', 'Outerwear'].map(cat => (
                                <li key={cat}>
                                    <button
                                        onClick={() => { handleFilterChange('category', cat); setIsFilterOpen(false); }}
                                        className={cn("hover:text-primary transition-colors", categoryParam === cat && "text-primary font-medium")}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Sort By</h3>
                        <select
                            className="w-full text-sm border border-input rounded-md p-2 bg-background"
                            value={sortParam}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </aside>

                {/* Backdrop for mobile filter */}
                {isFilterOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsFilterOpen(false)} />
                )}

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold font-serif">{categoryParam === 'All' ? 'All Products' : categoryParam}</h1>
                        <button
                            className="md:hidden flex items-center text-sm font-medium border border-input px-3 py-1.5 rounded-md"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <Filter className="w-4 h-4 mr-2" /> Filters
                        </button>
                        <p className="text-sm text-muted-foreground hidden md:block">
                            Showing {products.length} results
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            No products found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<ShopPageLoader />}>
            <ShopContent />
        </Suspense>
    );
}
