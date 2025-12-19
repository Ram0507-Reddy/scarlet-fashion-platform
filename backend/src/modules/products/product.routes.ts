import { Router } from 'express';
import * as ProductController from './product.controller';
import { requireAuth, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:slug', ProductController.getProductBySlug);

router.post('/', requireAuth, requireAdmin, ProductController.createProduct);
router.patch('/:id', requireAuth, requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireAuth, requireAdmin, ProductController.deleteProduct);

export default router;
