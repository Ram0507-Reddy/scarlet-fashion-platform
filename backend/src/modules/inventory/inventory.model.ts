import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
    productId: mongoose.Types.ObjectId;
    size: string;
    price: number;
    stock: number;
}

const inventorySchema = new Schema<IInventory>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 }
}, {
    timestamps: true
});

inventorySchema.index({ productId: 1, size: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
