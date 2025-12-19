import { Router } from 'express';
import * as OrderController from './order.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getMyOrders);

// Admin Routes for Orders
router.patch('/:id/mark-paid', requireAdmin, OrderController.markOrderPaid);

export default router;
