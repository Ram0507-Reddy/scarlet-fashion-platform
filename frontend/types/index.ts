export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface ProductSize {
    size: string; // S, M, L, XL
    stock: number;
    price?: number; // Override base price
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    sizes: ProductSize[];
    isActive: boolean;
    createdAt: string;
}

export interface CartItem {
    productId: string;
    variantId?: string; // or size
    size: string;
    quantity: number;
    product?: Product; // hydrated
}

export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    size: string;
    quantity: number;
    price: number;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'BILLED' | 'SHIPPED' | 'CANCELLED';

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    shippingAddress: string; // simplified
    paymentMethod: 'COD' | 'UPI';
    createdAt: string;
}

export interface ApiResponse<T> {
    data: T | null;
    message?: string;
    success: boolean;
}
