import { Router } from 'express';
import * as AdminController from './admin.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', AdminController.getDashboardStats);

export default router;
