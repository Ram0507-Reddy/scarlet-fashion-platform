import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    size: string;
    price: number;
    qty: number;
}

export interface IOrder extends Document {
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    paymentMethod: 'COD' | 'UPI';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    billingStatus: 'UNBILLED' | 'BILLED';
    orderStatus: 'PLACED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        size: String,
        price: Number,
        qty: Number
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    billingStatus: { type: String, enum: ['UNBILLED', 'BILLED'], default: 'UNBILLED' },
    orderStatus: { type: String, enum: ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PLACED' }
}, {
    timestamps: true
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ billingStatus: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
