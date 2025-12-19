import { ApiResponse, User } from '@/types';
import { CONFIG } from '@/config';

export const authService = {
    login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, data: null, message: data.message || 'Login failed' };

            // Store tokens if implemented manually, or rely on cookie/response
            // The backend sets httpOnly cookie, but also sends user data. 
            // We rely on the `token` in response if needed for headers, or cookie.
            // Backend controller sends { message, user }. Does it send token?
            // Re-checking controller: { message: '..., user: ...' }. Tokens are in Cookies.
            // Front-end might need to know "I am logged in".
            // We'll trust the success response.
            return { success: true, data: { user: data.user, token: 'cookie-managed' } };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    register: async (email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, data: null, message: data.message || 'Registration failed' };

            return { success: true, data: { user: data.user, token: 'cookie-managed' } };
        } catch (error: any) {
            return { success: false, data: null, message: error.message };
        }
    },

    logout: async () => {
        try {
            await fetch(`${CONFIG.API_URL}/auth/logout`, { method: 'POST' });
            return { success: true, data: null };
        } catch (error) {
            return { success: false, data: null, message: 'Logout failed' };
        }
    }
};
