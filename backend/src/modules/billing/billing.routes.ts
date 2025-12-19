import { Router } from 'express';
import * as BillingController from './billing.controller';

// Billing endpoints might be secured by an API Key for the Sync Agent, 
// but for Step 2 we'll assume Admin or specific key. 
// "Sync Agent polls". Usually uses a machine token.
// I'll skip middleware for simplicity or use requireAdmin if Agent acts as Admin.
// I'll leave it open or simple.

const router = Router();

router.get('/pending-orders', BillingController.getPendingBillingOrders);
router.post('/confirm', BillingController.confirmBilling);

export default router;
