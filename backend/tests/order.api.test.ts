import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';
import { Order } from '../src/models/Order.js';
import { OrderStatus } from '../src/services/state-machine.service.js';

describe('Order API', () => {
  let item1: any;
  let item2Unavailable: any;

  beforeEach(async () => {
    item1 = await MenuItem.create({
      name: 'Paneer Pistachio Tart',
      description: 'Hand-rolled savory tartlet with rich spiced paneer.',
      price: 200.0,
      currency: 'INR',
      category: 'Starters',
      imageUrl: '/images/tart.jpg',
      isAvailable: true,
      dietary: ['Vegetarian'],
      preparationTimeMinutes: 15,
    });

    item2Unavailable = await MenuItem.create({
      name: 'Seasonal Truffle Chaat',
      description: 'Crisp wafers with winter truffle cream.',
      price: 350.0,
      currency: 'INR',
      category: 'Starters',
      imageUrl: '/images/chaat.jpg',
      isAvailable: false,
      dietary: ['Vegetarian'],
      preparationTimeMinutes: 10,
    });
  });

  describe('POST /api/orders (Creation & Pricing)', () => {
    it('creates an order with server-calculated totals, snapshot prices, and initial event', async () => {
      const payload = {
        customer: {
          name: 'Elena Rostova',
          phone: '+49 170 1234567',
          deliveryAddress: 'Torstraße 140, 10119 Berlin',
          notes: 'Ring bell for 3rd floor',
        },
        items: [
          {
            menuItemId: item1._id.toString(),
            quantity: 2,
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const order = res.body.data;
      expect(order.orderReference).toMatch(/^CR-[A-Z0-9]+$/);
      expect(order.status).toBe(OrderStatus.RECEIVED);
      expect(order.items.length).toBe(1);
      expect(order.items[0].name).toBe('Paneer Pistachio Tart');
      expect(order.items[0].unitPrice).toBe(200.0);
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].itemTotal).toBe(400.0);

      // Verify server calculated pricing in INR
      expect(order.pricing.subtotal).toBe(400.0);
      expect(order.pricing.deliveryFee).toBe(49);
      expect(order.pricing.serviceFee).toBe(20);
      expect(order.pricing.tax).toBe(20); // 5% of 400 = 20
      expect(order.pricing.total).toBe(489); // 400 + 49 + 20 + 20
      expect(order.pricing.currency).toBe('INR');

      // Verify event history
      expect(Array.isArray(order.events)).toBe(true);
      expect(order.events.length).toBe(1);
      expect(order.events[0].toStatus).toBe(OrderStatus.RECEIVED);
      expect(order.events[0].source).toBe('CUSTOMER');
    });

    it('rejects order with unavailable item', async () => {
      const payload = {
        customer: {
          name: 'Marcus Vance',
          phone: '+49 171 9998888',
          deliveryAddress: 'Rosenthaler Str. 42, Berlin',
        },
        items: [
          {
            menuItemId: item2Unavailable._id.toString(),
            quantity: 1,
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('is currently unavailable');
    });

    it('validates customer fields and items list', async () => {
      const invalidPayload = {
        customer: {
          name: 'A', // too short
          phone: '',
          deliveryAddress: '',
        },
        items: [],
      };

      const res = await request(app).post('/api/orders').send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/orders/:id', () => {
    it('retrieves an existing order by ID or reference with full event history', async () => {
      const createRes = await request(app).post('/api/orders').send({
        customer: {
          name: 'Klaus Müller',
          phone: '+49 172 5556677',
          deliveryAddress: 'Brunnenstraße 20, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });

      const orderId = createRes.body.data._id;
      const orderRef = createRes.body.data.orderReference;

      const resById = await request(app).get(`/api/orders/${orderId}`);
      expect(resById.status).toBe(200);
      expect(resById.body.data.orderReference).toBe(orderRef);

      const resByRef = await request(app).get(`/api/orders/${orderRef}`);
      expect(resByRef.status).toBe(200);
      expect(resByRef.body.data._id).toBe(orderId);
    });

    it('returns 404 for unknown order ID', async () => {
      const res = await request(app).get('/api/orders/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });

    it('GET /api/orders retrieves list of orders with filter', async () => {
      const order1 = await request(app).post('/api/orders').send({
        customer: {
          name: 'Customer A',
          phone: '+49 170 1111111',
          deliveryAddress: 'Main St 1, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });
      const order2 = await request(app).post('/api/orders').send({
        customer: {
          name: 'Customer B',
          phone: '+49 170 2222222',
          deliveryAddress: 'Main St 2, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });

      const resAll = await request(app).get('/api/orders');
      expect(resAll.status).toBe(200);
      expect(resAll.body.data.length).toBeGreaterThanOrEqual(2);

      const ref1 = order1.body.data.orderReference;
      const resFiltered = await request(app).get(`/api/orders?refs=${ref1}`);
      expect(resFiltered.status).toBe(200);
      expect(resFiltered.body.data.length).toBe(1);
      expect(resFiltered.body.data[0].orderReference).toBe(ref1);
    });
  });

  describe('Status Transitions (State Machine enforcement)', () => {
    it('allows valid sequence: RECEIVED -> ACCEPTED -> PREPARING', async () => {
      const order = await request(app).post('/api/orders').send({
        customer: {
          name: 'Sophie Lin',
          phone: '+49 173 1112233',
          deliveryAddress: 'Kastanienallee 12, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });

      const orderId = order.body.data._id;

      // 1. ACCEPT
      const acceptRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.ACCEPTED, note: 'Kitchen confirmed ticket' });
      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe(OrderStatus.ACCEPTED);

      // 2. PREPARING
      const prepRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.PREPARING });
      expect(prepRes.status).toBe(200);
      expect(prepRes.body.data.status).toBe(OrderStatus.PREPARING);

      // Check event history grew to 3 events
      const getRes = await request(app).get(`/api/orders/${orderId}`);
      expect(getRes.body.data.events.length).toBe(3);
    });

    it('rejects invalid transition: RECEIVED -> DELIVERED (skipping stages)', async () => {
      const order = await request(app).post('/api/orders').send({
        customer: {
          name: 'Sophie Lin',
          phone: '+49 173 1112233',
          deliveryAddress: 'Kastanienallee 12, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });

      const orderId = order.body.data._id;

      const badRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.DELIVERED });

      expect(badRes.status).toBe(400);
      expect(badRes.body.success).toBe(false);
      expect(badRes.body.error).toContain('Invalid status transition');
    });

    it('forbids cancellation after preparation starts', async () => {
      const order = await request(app).post('/api/orders').send({
        customer: {
          name: 'Sophie Lin',
          phone: '+49 173 1112233',
          deliveryAddress: 'Kastanienallee 12, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });
      const orderId = order.body.data._id;

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.ACCEPTED });
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.PREPARING });

      // Attempt cancel from PREPARING
      const cancelRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.CANCELLED });

      expect(cancelRes.status).toBe(400);
      expect(cancelRes.body.error).toContain('Invalid status transition');
    });
  });

  describe('DELETE /api/orders/:id (Conditional deletion)', () => {
    it('allows deleting an order in RECEIVED status', async () => {
      const order = await request(app).post('/api/orders').send({
        customer: {
          name: 'Tara Gomez',
          phone: '+49 174 4445566',
          deliveryAddress: 'Choriner Str. 5, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });
      const orderId = order.body.data._id;

      const deleteRes = await request(app).delete(`/api/orders/${orderId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const findRes = await request(app).get(`/api/orders/${orderId}`);
      expect(findRes.status).toBe(404);
    });

    it('rejects deleting an order that is actively PREPARING', async () => {
      const order = await request(app).post('/api/orders').send({
        customer: {
          name: 'Tara Gomez',
          phone: '+49 174 4445566',
          deliveryAddress: 'Choriner Str. 5, Berlin',
        },
        items: [{ menuItemId: item1._id.toString(), quantity: 1 }],
      });
      const orderId = order.body.data._id;

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.ACCEPTED });
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.PREPARING });

      const deleteRes = await request(app).delete(`/api/orders/${orderId}`);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.error).toContain('Cannot delete order in active progress');
    });
  });
});
