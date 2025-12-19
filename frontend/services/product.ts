import { Product, ApiResponse } from '@/types';
import { CONFIG } from '@/config';

// Mock Interfaces if not in types (just to be safe), but they should be.
export const productService = {
    getAllProducts: async (category?: string): Promise<ApiResponse<Product[]>> => {
        try {
            // Logic for URL construction
            const url = `${CONFIG.API_URL}/products${category && category !== 'All' ? `?category=${category}` : ''}`;
            // Note: Backend Controller `getAllProducts` doesn't strictly filter by query param yet (Step 2 Implementation).
            // It returns ALL. WE MIGHT NEED TO UPDATE BACKEND if we want filter. 
            // User asked to "Complete architecture", so I should probably support it or filter client side.
            // For now, let's fetch all and filter client side if backend ignores params, or accept it.
            // Real architecture: Backend should filter. 
            // I'll stick to fetching.

            const res = await fetch(url);
            const data = await res.json();

            // Simple client-side filter if backend returns all (since I didn't verify backend query support deep enough)
            // I recall `Product.find({ isActive: true })`. No query params used.
            // I should update backend or just filter here. Filtering here is safer for "Working Now".
            let products: Product[] = Array.isArray(data) ? data : [];

            if (category && category !== 'All') {
                products = products.filter(p => p.category === category);
            }

            return { success: true, data: products };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/products/${slug}`);
            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();
            return { success: true, data: data };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    // Just placeholders if UI calls them, but we didn't implement specialized "Recommended" in backend.
    getFeaturedProducts: async (): Promise<ApiResponse<Product[]>> => {
        // Just return first 4
        const res = await productService.getAllProducts();
        if (res.data) {
            return { success: true, data: res.data.slice(0, 4) };
        }
        return res;
    }
};
