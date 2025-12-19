import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

// Retry Configuration
const MAX_RETRIES = 3;

const client: AxiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'x-api-key': config.API_KEY,
        'x-shop-id': config.SHOP_ID
    },
    timeout: 10000
});

// Simple exponential backoff wrapper
export const apiCall = async (fn: () => Promise<any>) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            return await fn();
        } catch (error: any) {
            retries++;
            if (retries === MAX_RETRIES) throw error;
            console.warn(`[API] Network error, retrying (${retries}/${MAX_RETRIES})...`);
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
        }
    }
};

export const fetchPendingOrders = async () => {
    // We assume backend has /api/billing/pending-orders
    // Step 2 implementation had /billing/pending-orders under `billingRoutes` 
    // mapped to `/api/billing`.
    const response = await apiCall(() => client.get('/billing/pending-orders'));
    return response.data;
};

export const pushBillingConfirmation = async (payload: { orderId: string, success: boolean, error?: string }) => {
    return apiCall(() => client.post('/billing/confirm', payload));
};
