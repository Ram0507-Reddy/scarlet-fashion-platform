import { Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { BillingLog } from '../admin/admin.model';
import { z } from 'zod';

export const getPendingBillingOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Orders that are PAID but UNBILLED
        const orders = await Order.find({ paymentStatus: 'PAID', billingStatus: 'UNBILLED' });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const confirmBillingSchema = z.object({
    orderId: z.string(),
    success: z.boolean(),
    error: z.string().optional()
});

export const confirmBilling = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, success, error } = confirmBillingSchema.parse(req.body);

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (success) {
            order.billingStatus = 'BILLED';
            await order.save();
        }

        // Log the attempt
        await BillingLog.create({
            orderId: order._id,
            status: success ? 'SUCCESS' : 'FAILED',
            errorMessage: error
        });

        res.json({ message: 'Billing status updated' });
    } catch (error) {
        next(error);
    }
};
