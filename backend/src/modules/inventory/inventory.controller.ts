import { Request, Response, NextFunction } from 'express';
import { Inventory } from './inventory.model';
import { z } from 'zod';

const updateInventorySchema = z.object({
    productId: z.string(),
    size: z.string(),
    stock: z.number().optional(),
    price: z.number().optional()
});

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, size, stock, price } = updateInventorySchema.parse(req.body);

        const update: any = {};
        if (stock !== undefined) update.stock = stock;
        if (price !== undefined) update.price = price;

        const inventory = await Inventory.findOneAndUpdate(
            { productId, size },
            { $set: update },
            { new: true, upsert: true } // Upsert if new size added logic?
        );

        res.json({ message: 'Inventory updated', inventory });
    } catch (error) {
        next(error);
    }
};
