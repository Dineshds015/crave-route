import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus } from '../services/state-machine.service.js';

export interface IOrderStatusEvent extends Document {
  orderId: Types.ObjectId;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  timestamp: Date;
  note: string;
  source: 'SYSTEM' | 'KITCHEN' | 'CUSTOMER' | 'SIMULATION';
}

const OrderStatusEventSchema = new Schema<IOrderStatusEvent>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    fromStatus: { type: String, enum: [...Object.values(OrderStatus), null], default: null },
    toStatus: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    note: { type: String, required: true },
    source: {
      type: String,
      enum: ['SYSTEM', 'KITCHEN', 'CUSTOMER', 'SIMULATION'],
      default: 'SYSTEM',
    },
  },
  { timestamps: false }
);

OrderStatusEventSchema.index({ orderId: 1, timestamp: 1 });

export const OrderStatusEvent = mongoose.model<IOrderStatusEvent>(
  'OrderStatusEvent',
  OrderStatusEventSchema
);
