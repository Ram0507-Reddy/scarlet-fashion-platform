import { Router } from 'express';
import * as CartController from './cart.controller';
import { requireAuth } from '@/middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.delete('/', CartController.clearCart);

export default router;
