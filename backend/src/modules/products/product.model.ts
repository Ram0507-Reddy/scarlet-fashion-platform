import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    category: string;
    images: string[];
    isActive: boolean;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
