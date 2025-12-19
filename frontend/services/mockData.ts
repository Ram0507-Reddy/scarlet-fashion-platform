import { Product, User, Order, ProductSize } from '@/types';

// Initial Mock Data Helpers

const createProduct = (id: string, name: string, price: number, cat: string, img: string): Product => ({
    id,
    slug: name.toLowerCase().replace(/ /g, '-'),
    name,
    description: `Premium ${name} suitable for any occasion. Crafted with high quality materials.`,
    price,
    images: [img],
    category: cat,
    sizes: [
        { size: 'XS', stock: 10 },
        { size: 'S', stock: 15 },
        { size: 'M', stock: 20 },
        { size: 'L', stock: 5 },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
});

export const MOCK_PRODUCTS: Product[] = [
    createProduct('1', 'Scarlet Velvet Dress', 129.99, 'Dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'),
    createProduct('2', 'Midnight Silk Blouse', 89.99, 'Tops', 'https://images.unsplash.com/photo-1551163943-3f6a29e410a3?auto=format&fit=crop&q=80&w=800'),
    createProduct('3', 'Classic Trench Coat', 249.99, 'Outerwear', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'),
    createProduct('4', 'High-Waist Linen Trousers', 110.00, 'Bottoms', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800'),
    createProduct('5', 'Floral Summer Midi', 95.00, 'Dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'),
    createProduct('6', 'Evening Gown Black', 299.00, 'Dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'),
];

export const MOCK_USERS: User[] = [
    { id: 'user-1', email: 'user@example.com', name: 'Jane Doe', role: 'USER', avatar: 'https://ui-avatars.com/api/?name=Jane+Doe' },
    { id: 'admin-1', email: 'admin@example.com', name: 'Scarlet Admin', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Admin' },
];

export const MOCK_ORDERS: Order[] = [];
