import { z } from 'zod';
import { OrderStatus } from '../services/state-machine.service.js';

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
    phone: z.string().trim().min(6, 'Valid phone number is required'),
    deliveryAddress: z.string().trim().min(5, 'Delivery address must be at least 5 characters long'),
    notes: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, 'Menu item ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Quantity cannot exceed 20 per item'),
      })
    )
    .min(1, 'Order must contain at least one item'),
  idempotencyKey: z.string().optional(),
  isSimulated: z.boolean().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'UPI', 'CARD']).optional().default('CASH_ON_DELIVERY'),
});

export const transitionStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status specified' }),
  }),
  expectedVersion: z.number().optional(),
  note: z.string().optional(),
  source: z.enum(['SYSTEM', 'KITCHEN', 'CUSTOMER', 'SIMULATION']).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>;
