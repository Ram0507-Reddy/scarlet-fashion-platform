import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    actorId: mongoose.Types.ObjectId;
    action: string;
    entity: string;
    entityId: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export interface IBillingLog extends Document {
    orderId: mongoose.Types.ObjectId;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    lastAttempt: Date;
    errorMessage?: string;
}

const billingLogSchema = new Schema<IBillingLog>({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    lastAttempt: { type: Date, default: Date.now },
    errorMessage: String
});

export const BillingLog = mongoose.model<IBillingLog>('BillingLog', billingLogSchema);
