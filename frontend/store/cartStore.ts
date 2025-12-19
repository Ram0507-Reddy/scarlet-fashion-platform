import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, size: string, quantity: number) => void;
    removeItem: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, size, quantity) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.productId === product.id && item.size === size
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        return { items: newItems };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product.id,
                                size,
                                quantity,
                                product, // store product snapshot for simplicity in mock
                            },
                        ],
                    };
                });
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.productId === productId && item.size === size)
                    ),
                }));
            },

            updateQuantity: (productId, size, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId && item.size === size
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((acc, item) => acc + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((acc, item) => {
                    const price = item.product?.price || 0;
                    return acc + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'scarlet-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
