import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus } from '../services/state-machine.service.js';

export interface IOrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface IOrderPricing {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  currency?: string;
}

export interface ICustomer {
  name: string;
  phone: string;
  deliveryAddress: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderReference: string;
  customer: ICustomer;
  items: IOrderItemSnapshot[];
  pricing: IOrderPricing;
  paymentMethod: 'CASH_ON_DELIVERY' | 'UPI' | 'CARD';
  status: OrderStatus;
  version: number;
  idempotencyKey?: string;
  isSimulated: boolean;
  estimatedDeliveryMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSnapshotSchema], required: true },
    pricing: { type: OrderPricingSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['CASH_ON_DELIVERY', 'UPI', 'CARD'],
      default: 'CASH_ON_DELIVERY',
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.RECEIVED,
      index: true,
    },
    version: { type: Number, default: 0 },
    idempotencyKey: { type: String, sparse: true, index: true },
    isSimulated: { type: Boolean, default: true },
    estimatedDeliveryMinutes: { type: Number, default: 35 },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
