import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { sseService } from '../services/sse.service.js';
import { simulationService } from '../services/simulation.service.js';
import {
  createOrderSchema,
  transitionStatusSchema,
} from '../validators/order.validator.js';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const idempotencyKey =
        (req.headers['idempotency-key'] as string) || validatedData.idempotencyKey;

      const result = await orderService.createOrder(validatedData, idempotencyKey);

      res.status(result.isExisting ? 200 : 201).json({
        success: true,
        data: {
          ...result.order.toObject(),
          events: result.events,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orderData = await orderService.getOrder(id);
      res.json({
        success: true,
        data: orderData,
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const refs = req.query.refs
        ? (req.query.refs as string)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
      const status = req.query.status as any;
      const phone = req.query.phone ? (req.query.phone as string).trim() : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const orders = await orderService.getOrders({ refs, status, phone }, limit);
      res.json({
        success: true,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  }

  async transitionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = transitionStatusSchema.parse(req.body);

      const updated = await orderService.transitionStatus(
        id,
        validatedData.status,
        validatedData.note,
        validatedData.source || 'SYSTEM',
        validatedData.expectedVersion
      );

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await orderService.deleteOrder(id);
      res.json({
        success: true,
        message: 'Order deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async streamOrderEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Ensure order exists first
      const order = await orderService.getOrder(id);

      // Register SSE client for both order ID and reference code
      sseService.addClient([order._id.toString(), order.orderReference], res);

      // Immediately send current order state
      res.write(`event: order_snapshot\ndata: ${JSON.stringify(order)}\n\n`);
    } catch (err) {
      next(err);
    }
  }

  async simulateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrder(id);
      const delayMs = req.body.delayMs ? parseInt(req.body.delayMs, 10) : undefined;

      simulationService.startSimulation(order._id.toString(), order.status, delayMs);

      res.json({
        success: true,
        message: 'Kitchen Journey simulation initiated for order.',
        currentStatus: order.status,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
