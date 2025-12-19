import { Router } from 'express';

import authRoutes from '@/modules/auth/auth.routes';
import productRoutes from '@/modules/products/product.routes';
import cartRoutes from '@/modules/cart/cart.routes';
import orderRoutes from '@/modules/orders/order.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import billingRoutes from '@/modules/billing/billing.routes';

import { updateInventory } from '@/modules/inventory/inventory.controller';
import { requireAuth, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Scarlet Fashion API' });
});

// Auth Routes
router.use('/auth', authRoutes);

// Product Routes
router.use('/products', productRoutes);

// Admin Inventory Route (Quick patch)
router.patch('/admin/inventory', requireAuth, requireAdmin, updateInventory);

// Cart Routes
router.use('/cart', cartRoutes);

// Order Routes
router.use('/orders', orderRoutes);

// Admin Routes
router.use('/admin', adminRoutes);

// Billing Routes
router.use('/billing', billingRoutes);

export default router;
