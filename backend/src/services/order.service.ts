import { orderRepository } from '../repositories/order.repository.js';
import { menuService } from './menu.service.js';
import { sseService } from './sse.service.js';
import { simulationService } from './simulation.service.js';
import {
  OrderStatus,
  isValidTransition,
  getAllowedTransitions,
  getDefaultEventNote,
} from './state-machine.service.js';
import { CreateOrderInput } from '../validators/order.validator.js';
import { IOrder } from '../models/Order.js';

export class OrderService {
  constructor() {
    // Decoupled simulation hook
    simulationService.setTransitionHandler(
      async (orderId, toStatus, note, source) => {
        return this.transitionStatus(orderId, toStatus, note, source);
      }
    );
  }

  generateOrderReference(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CR-${code}`;
  }

  async createOrder(
    input: CreateOrderInput,
    idempotencyKey?: string
  ): Promise<{ order: IOrder; isExisting: boolean; events: any[] }> {
    // 1. Idempotency check
    const effectiveKey = idempotencyKey || input.idempotencyKey;
    if (effectiveKey) {
      const existing = await orderRepository.findByIdempotencyKey(effectiveKey);
      if (existing) {
        const events = await orderRepository.getEventsForOrder(existing._id);
        return { order: existing, isExisting: true, events };
      }
    }

    // 2. Validate menu items and compute trusted server-side pricing
    const { items: snapshotItems, subtotal } =
      await menuService.validateAndResolveOrderItems(input.items);

    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const serviceFee = 20;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + deliveryFee + serviceFee + tax).toFixed(2));

    let orderReference = this.generateOrderReference();
    // Guarantee uniqueness
    while (await orderRepository.findByIdOrReference(orderReference)) {
      orderReference = this.generateOrderReference();
    }

    // 3. Persist order
    const isSimulated = input.isSimulated !== undefined ? input.isSimulated : true;
    const newOrder = await orderRepository.create({
      orderReference,
      customer: input.customer,
      items: snapshotItems,
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        total,
        currency: 'INR',
      },
      paymentMethod: input.paymentMethod || 'CASH_ON_DELIVERY',
      status: OrderStatus.RECEIVED,
      version: 0,
      idempotencyKey: effectiveKey,
      isSimulated,
      estimatedDeliveryMinutes: 30 + snapshotItems.length * 5,
    });

    // 4. Persist initial event log
    const initialEvent = await orderRepository.createStatusEvent({
      orderId: newOrder._id,
      fromStatus: null,
      toStatus: OrderStatus.RECEIVED,
      note: 'Order placed by customer and entered into kitchen queue.',
      source: 'CUSTOMER',
    });

    // 5. Start simulation if enabled
    if (isSimulated && process.env.NODE_ENV !== 'test') {
      simulationService.startSimulation(newOrder._id.toString(), OrderStatus.RECEIVED);
    }

    return {
      order: newOrder,
      isExisting: false,
      events: [initialEvent],
    };
  }

  async getOrder(idOrRef: string): Promise<any> {
    const order = await orderRepository.findByIdOrReference(idOrRef);
    if (!order) {
      const err: any = new Error(`Order "${idOrRef}" not found.`);
      err.status = 404;
      throw err;
    }

    const events = await orderRepository.getEventsForOrder(order._id);
    const allowedTransitions = getAllowedTransitions(order.status);
    const isSimulating = simulationService.isSimulating(order._id.toString());

    return {
      ...order.toObject(),
      events,
      allowedTransitions,
      isSimulating,
    };
  }

  async getOrders(
    filter: { refs?: string[]; status?: OrderStatus; phone?: string } = {},
    limit = 50
  ): Promise<any[]> {
    const orders = await orderRepository.findMany(filter, limit);
    return Promise.all(
      orders.map(async (o) => {
        const events = await orderRepository.getEventsForOrder(o._id);
        const allowedTransitions = getAllowedTransitions(o.status);
        return {
          ...o.toObject(),
          events,
          allowedTransitions,
        };
      })
    );
  }

  async transitionStatus(
    idOrRef: string,
    toStatus: OrderStatus,
    note?: string,
    source: 'SYSTEM' | 'KITCHEN' | 'CUSTOMER' | 'SIMULATION' = 'SYSTEM',
    expectedVersion?: number
  ): Promise<any> {
    const order = await orderRepository.findByIdOrReference(idOrRef);
    if (!order) {
      const err: any = new Error(`Order "${idOrRef}" not found.`);
      err.status = 404;
      throw err;
    }

    const currentStatus = order.status;

    // Validate transition
    if (!isValidTransition(currentStatus, toStatus)) {
      const err: any = new Error(
        `Invalid status transition from ${currentStatus} to ${toStatus}. Allowed transitions: ${getAllowedTransitions(
          currentStatus
        ).join(', ') || 'None (terminal)'}`
      );
      err.status = 400;
      throw err;
    }

    // Atomic update with optimistic concurrency check
    const updatedOrder = await orderRepository.updateStatusWithConcurrencyCheck(
      order._id.toString(),
      currentStatus,
      toStatus,
      expectedVersion
    );

    if (!updatedOrder) {
      const err: any = new Error(
        'Concurrent update conflict: the order status or version was modified by another operation.'
      );
      err.status = 409;
      throw err;
    }

    // Record immutable audit event
    const eventNote = note || getDefaultEventNote(toStatus);
    const event = await orderRepository.createStatusEvent({
      orderId: updatedOrder._id,
      fromStatus: currentStatus,
      toStatus,
      note: eventNote,
      source,
    });

    const events = await orderRepository.getEventsForOrder(updatedOrder._id);
    const allowedTransitions = getAllowedTransitions(updatedOrder.status);

    const payload = {
      ...updatedOrder.toObject(),
      events,
      allowedTransitions,
      lastEvent: event,
      isSimulating: simulationService.isSimulating(updatedOrder._id.toString()),
    };

    // Broadcast live update to connected SSE clients
    sseService.broadcastToOrder(updatedOrder._id.toString(), 'order_updated', payload);
    sseService.broadcastToOrder(updatedOrder.orderReference, 'order_updated', payload);

    // Stop simulation if order reached terminal state
    if (toStatus === OrderStatus.DELIVERED || toStatus === OrderStatus.CANCELLED) {
      simulationService.stopSimulation(updatedOrder._id.toString());
    }

    return payload;
  }

  async deleteOrder(idOrRef: string): Promise<boolean> {
    const order = await orderRepository.findByIdOrReference(idOrRef);
    if (!order) {
      const err: any = new Error(`Order "${idOrRef}" not found.`);
      err.status = 404;
      throw err;
    }

    if (
      order.status !== OrderStatus.RECEIVED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      const err: any = new Error(
        `Cannot delete order in active progress (${order.status}). Only RECEIVED or CANCELLED orders may be removed.`
      );
      err.status = 400;
      throw err;
    }

    simulationService.stopSimulation(order._id.toString());
    const deleted = await orderRepository.delete(order._id.toString());

    sseService.broadcastToOrder(order._id.toString(), 'order_deleted', {
      orderId: order._id,
      orderReference: order.orderReference,
    });

    return deleted;
  }
}

export const orderService = new OrderService();
