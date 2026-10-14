import mongoose, { Types } from 'mongoose';
import { Order, IOrder } from '../models/Order.js';
import { OrderStatusEvent, IOrderStatusEvent } from '../models/OrderStatusEvent.js';
import { OrderStatus } from '../services/state-machine.service.js';

export class OrderRepository {
  async findByIdOrReference(idOrRef: string): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(idOrRef)) {
      const order = await Order.findById(idOrRef).exec();
      if (order) return order;
    }
    return Order.findOne({ orderReference: idOrRef.toUpperCase() }).exec();
  }

  async findByIdempotencyKey(key: string): Promise<IOrder | null> {
    return Order.findOne({ idempotencyKey: key }).exec();
  }

  async findMany(
    filter: { refs?: string[]; status?: OrderStatus; phone?: string } = {},
    limit = 50
  ): Promise<IOrder[]> {
    const query: Record<string, any> = {};
    if (filter.refs && filter.refs.length > 0) {
      query.orderReference = { $in: filter.refs.map(r => r.toUpperCase()) };
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.phone) {
      const cleanPhone = filter.phone.replace(/[\s\-\(\)]/g, '').trim();
      const escaped = cleanPhone.replace(/^\+/, '\\+');
      query.$or = [
        { 'customer.phone': cleanPhone },
        { 'customer.phone': filter.phone.trim() },
        { 'customer.phone': { $regex: new RegExp(escaped, 'i') } },
      ];
    }
    return Order.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    return Order.create(orderData);
  }

  async createStatusEvent(eventData: {
    orderId: Types.ObjectId | string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note: string;
    source: 'SYSTEM' | 'KITCHEN' | 'CUSTOMER' | 'SIMULATION';
    timestamp?: Date;
  }): Promise<IOrderStatusEvent> {
    return OrderStatusEvent.create({
      ...eventData,
      timestamp: eventData.timestamp || new Date(),
    });
  }

  async getEventsForOrder(orderId: Types.ObjectId | string): Promise<IOrderStatusEvent[]> {
    return OrderStatusEvent.find({ orderId }).sort({ timestamp: 1 }).exec();
  }

  async updateStatusWithConcurrencyCheck(
    orderId: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    expectedVersion?: number
  ): Promise<IOrder | null> {
    const query: Record<string, any> = {
      _id: orderId,
      status: currentStatus,
    };

    if (typeof expectedVersion === 'number') {
      query.version = expectedVersion;
    }

    return Order.findOneAndUpdate(
      query,
      {
        $set: { status: newStatus },
        $inc: { version: 1 },
      },
      { new: true }
    ).exec();
  }

  async delete(orderId: string): Promise<boolean> {
    const deleted = await Order.findByIdAndDelete(orderId).exec();
    if (deleted) {
      await OrderStatusEvent.deleteMany({ orderId }).exec();
      return true;
    }
    return false;
  }
}

export const orderRepository = new OrderRepository();
