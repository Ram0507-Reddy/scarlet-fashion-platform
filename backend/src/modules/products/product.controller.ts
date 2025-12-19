import { Request, Response, NextFunction } from 'express';
import { Product } from './product.model';
import { Inventory } from '../inventory/inventory.model';
import { z } from 'zod';

const createProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    images: z.array(z.string()),
    slug: z.string(),
    variants: z.array(z.object({
        size: z.string(),
        price: z.number(),
        stock: z.number()
    }))
});

const updateProductSchema = createProductSchema.partial();

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

        // Aggregation for real-time inventory
        const productIds = products.map(p => p._id);
        const inventories = await Inventory.find({ productId: { $in: productIds } });

        const enriched = products.map(p => {
            const inv = inventories.filter(i => i.productId.toString() === p._id.toString());
            const minPrice = inv.length > 0 ? Math.min(...inv.map(i => i.price)) : 0;
            return { ...p.toObject(), minPrice, variants: inv };
        });

        res.json(enriched);
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const inventory = await Inventory.find({ productId: product._id });
        res.json({ ...product.toObject(), variants: inventory });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { variants, ...productData } = createProductSchema.parse(req.body);

        const product = await Product.create(productData);

        if (variants && variants.length > 0) {
            const inventoryDocs = variants.map(v => ({
                productId: product._id,
                ...v
            }));
            await Inventory.insertMany(inventoryDocs);
        }

        res.status(201).json({ message: 'Product created', productId: product._id });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { variants, ...updates } = updateProductSchema.parse(req.body);

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // If variants updates are complex (add/remove), we usually stick to specialized Inventory APIs.
        // But for basic updates, we might handle them here if provided.
        // For now, ignoring variants update here to keep it atomic with dedicated inventory endpoints, 
        // or we could overwrite if needed. 
        // Let's assume variants management is done via Inventory routes for stock safety.

        res.json({ message: 'Product updated', product });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true }); // Soft delete
        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted (soft)' });
    } catch (error) {
        next(error);
    }
};
