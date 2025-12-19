import { ApiResponse, Order } from '@/types';
import { CONFIG } from '@/config';

export const orderService = {
    createOrder: async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
        try {
            // Backend expects { paymentMethod: 'COD' | 'UPI' }
            // It pulls items from Redis Cart.
            const res = await fetch(`${CONFIG.API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Credentials included?
                // We need credentials for cookie!
                // We must ensure 'credentials: include' if using diff ports?
                // Next.js Proxy is better, but direct call needs credentials.
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            if (!res.ok) return { success: false, data: null, message: data.message };
            return { success: true, data: data.order };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/orders`); // Credentials needed
            const data = await res.json();
            return { success: true, data: Array.isArray(data) ? data : [] };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    // Placeholder for updateStatus?
    updateStatus: async (id: string, status: string) => {
        // No endpoint for user to update status. Admin only. 
        return { success: false, data: null, message: 'Not allowed' };
    }
};
