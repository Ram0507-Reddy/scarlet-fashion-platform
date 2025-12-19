import { Request, Response, NextFunction } from 'express';
import { redis } from '../../config/redis';
import { Inventory } from '../inventory/inventory.model';
import { z } from 'zod';

const addToCartSchema = z.object({
    productId: z.string(),
    size: z.string(),
    quantity: z.number().min(1).default(1)
});

// Mutex Lock Helper
const acquireLock = async (key: string, ttl: number = 5): Promise<boolean> => {
    const result = await redis.set(key, 'locked', 'EX', ttl, 'NX');
    return result === 'OK';
};

const releaseLock = async (key: string) => {
    await redis.del(key);
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        const cartKey = `cart:${userId}`;

        // Fetch cart items
        const cartItems = await redis.lrange(cartKey, 0, -1);
        const parsedItems = cartItems.map(item => JSON.parse(item));

        res.json(parsedItems);
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        const { productId, size, quantity } = addToCartSchema.parse(req.body);

        const cartKey = `cart:${userId}`;
        const lockKey = `lock:${productId}:${size}`;
        // This lock protects the READ-MODIFY-WRITE of the Inventory DB + Redis Cart consistency

        let retries = 5;
        while (retries > 0) {
            const locked = await acquireLock(lockKey, 5); // 5s Mutex
            if (locked) break;
            await new Promise(r => setTimeout(r, 200));
            retries--;
        }

        if (retries === 0) {
            return res.status(409).json({ message: 'System busy, please try again' });
        }

        try {
            // 1. Check Inventory
            const inventory = await Inventory.findOne({ productId, size });
            if (!inventory) throw new Error('Product variant not found');

            if (inventory.stock < quantity) {
                throw new Error('Insufficient stock');
            }

            // 2. Decrement Stock (Reservation)
            inventory.stock -= quantity;
            await inventory.save();

            // 3. Add to Redis Cart
            // We store full details to avoid db lookups on view (optimize as needed)
            const cartItem = {
                productId,
                size,
                quantity,
                price: inventory.price,
                addedAt: Date.now()
            };

            await redis.rpush(cartKey, JSON.stringify(cartItem));
            await redis.expire(cartKey, 900); // 15 mins TTL for the whole cart

            res.status(200).json({ message: 'Added to cart', cartItem });
        } finally {
            await releaseLock(lockKey);
        }
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user._id.toString();
        const cartKey = `cart:${userId}`;

        // Note: Ideally we should restore stock here if we are clearing "Active" reservations
        // But for "Clear Cart" explicit action, we assume user wants to empty it
        // Loop items and restore stock?
        const items = await redis.lrange(cartKey, 0, -1);
        for (const itemStr of items) {
            const item = JSON.parse(itemStr);
            const lockKey = `lock:${item.productId}:${item.size}`;
            // Simple best-effort restore
            await acquireLock(lockKey, 5);
            await Inventory.updateOne(
                { productId: item.productId, size: item.size },
                { $inc: { stock: item.quantity } }
            );
            await releaseLock(lockKey);
        }

        await redis.del(cartKey);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};
