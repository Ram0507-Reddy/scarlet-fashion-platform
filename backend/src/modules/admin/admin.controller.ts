import { Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { User } from '../auth/user.model';
import { Product } from '../products/product.model';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const totalOrders = await Order.countDocuments();
        // Aggregate total revenue (sum of totalAmount where paymentStatus = PAID)
        const revenueAgg = await Order.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        const pendingOrders = await Order.countDocuments({ orderStatus: 'PLACED' });
        // "PLACED" usually means pending processing/shipping

        const lowStockCount = 0; // Placeholder, would need aggregation on Inventory

        res.json({
            totalOrders,
            totalRevenue,
            pendingOrders,
            lowStockCount
        });
    } catch (error) {
        next(error);
    }
};
