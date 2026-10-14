import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';
import { OrderStatus } from '../src/services/state-machine.service.js';

describe('Concurrency Protection', () => {
  let item: any;

  beforeEach(async () => {
    item = await MenuItem.create({
      name: 'Smoked Garlic Naan Bites',
      description: 'Clay-oven baked sourdough naan bites.',
      price: 7.5,
      category: 'Starters',
      imageUrl: '/images/naan.jpg',
      isAvailable: true,
      dietary: ['Vegetarian'],
      preparationTimeMinutes: 8,
    });
  });

  it('handles race conditions with optimistic concurrency locking', async () => {
    const orderRes = await request(app).post('/api/orders').send({
      customer: {
        name: 'Concurrent User',
        phone: '+49 176 1234999',
        deliveryAddress: 'Invalidenstraße 10, Berlin',
      },
      items: [{ menuItemId: item._id.toString(), quantity: 1 }],
    });

    const orderId = orderRes.body.data._id;
    const initialVersion = orderRes.body.data.version;

    // Send two competing transition requests with the same expected current version
    const [req1, req2] = await Promise.all([
      request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.ACCEPTED, expectedVersion: initialVersion }),
      request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.CANCELLED, expectedVersion: initialVersion }),
    ]);

    // One must succeed (200), and the other must be rejected (409 Conflict or 400 state transition error)
    const statuses = [req1.status, req2.status];
    expect(statuses).toContain(200);
    expect(statuses.some(s => s === 409 || s === 400)).toBe(true);
  });
});
