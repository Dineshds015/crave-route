import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';
import { Order } from '../src/models/Order.js';

describe('Idempotent Order Creation', () => {
  let item: any;

  beforeEach(async () => {
    item = await MenuItem.create({
      name: 'Cardamom Saffron Chai Pot',
      description: 'Slow-brewed artisanal tea with whole spices.',
      price: 6.0,
      category: 'Beverages',
      imageUrl: '/images/chai.jpg',
      isAvailable: true,
      dietary: ['Vegetarian'],
      preparationTimeMinutes: 5,
    });
  });

  it('prevents duplicate orders when identical idempotency key is submitted', async () => {
    const idempotencyKey = 'idem-req-test-999-alpha';
    const payload = {
      customer: {
        name: 'Arjun Mehta',
        phone: '+49 175 7778899',
        deliveryAddress: 'Veteranenstraße 18, 10119 Berlin',
      },
      items: [{ menuItemId: item._id.toString(), quantity: 3 }],
    };

    // First attempt
    const res1 = await request(app)
      .post('/api/orders')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res1.status).toBe(201);
    const orderId1 = res1.body.data._id;
    const orderRef1 = res1.body.data.orderReference;

    // Immediate second attempt with same idempotency key (simulating network retry / double click)
    const res2 = await request(app)
      .post('/api/orders')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res2.status).toBe(200); // 200 OK or 201 returning existing order
    expect(res2.body.data._id).toBe(orderId1);
    expect(res2.body.data.orderReference).toBe(orderRef1);

    // Verify exactly ONE order exists in DB
    const totalOrders = await Order.countDocuments({});
    expect(totalOrders).toBe(1);
  });
});
