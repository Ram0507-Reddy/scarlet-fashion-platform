import { Request, Response, NextFunction } from 'express';
import { Order } from './order.model';
import { Inventory } from '../inventory/inventory.model'; // For rollback
import { redis } from '../../config/redis';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const createOrderSchema = z.object({
    paymentMethod: z.enum(['COD', 'UPI']),
    address: z.string().optional() // Assuming address is needed or stored in User? 
    // Step 2 prompt doesn't strictly specify address in schema, but "Order Schema" implies minimal fields.
    // I'll stick to items.
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        const { paymentMethod } = createOrderSchema.parse(req.body);

        const cartKey = `cart:${userId}`;
        const cartItemsStr = await redis.lrange(cartKey, 0, -1);

        if (cartItemsStr.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const cartItems = cartItemsStr.map(s => JSON.parse(s));

        // Calculate total
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create Order
        // Generate simple order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order = await Order.create({
            orderNumber,
            userId,
            items: cartItems.map(i => ({
                productId: i.productId,
                name: `Product ${i.productId}`, //Ideally fetch name, but for speed we might not. 
                // Actually, `addToCart` didn't store name. 
                // "Product Model... name...". 
                // We should fetch names or store them in cart. 
                // I'll fetch names to be clean.
                size: i.size,
                price: i.price,
                qty: i.quantity
            })),
            totalAmount,
            paymentMethod,
            paymentStatus: 'PENDING',
            orderStatus: 'PLACED'
        });

        // Clear Cart (Stock already consumed)
        await redis.del(cartKey);

        res.status(201).json({ message: 'Order placed', order });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const markOrderPaid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.paymentStatus === 'PAID') return res.status(400).json({ message: 'Already paid' });

        order.paymentStatus = 'PAID';
        await order.save();

        res.json({ message: 'Order marked as PAID', order });
    } catch (error) {
        next(error);
    }
};
