import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';
import { sseService } from '../src/services/sse.service.js';

describe('SSE Live Updates & Reconnection Endpoint', () => {
  let orderId: string;
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const addr: any = server.address();
        port = addr.port;
        resolve();
      });
    });

    const item = await MenuItem.create({
      name: 'Pistachio Kulfi Pop',
      description: 'Slow-churned frozen cardamom and pistachio cream.',
      price: 5.5,
      category: 'Desserts',
      imageUrl: '/images/kulfi.jpg',
      isAvailable: true,
      dietary: ['Vegetarian'],
      preparationTimeMinutes: 5,
    });

    const createRes = await fetch(`http://127.0.0.1:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Leon Becker',
          phone: '+49 179 4443322',
          deliveryAddress: 'Oderberger Str. 24, Berlin',
        },
        items: [{ menuItemId: item._id.toString(), quantity: 1 }],
      }),
    });
    const createData = await createRes.json();
    orderId = createData.data._id;
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('establishes SSE stream with correct headers and initial snapshot', async () => {
    const receivedData = await new Promise<string>((resolve, reject) => {
      let buffer = '';
      const req = http.get(
        `http://127.0.0.1:${port}/api/orders/${orderId}/events`,
        (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('text/event-stream');
          expect(res.headers['cache-control']).toContain('no-cache');

          res.on('data', (chunk) => {
            buffer += chunk.toString();
            if (buffer.includes('event: order_snapshot')) {
              req.destroy();
              resolve(buffer);
            }
          });
        }
      );

      req.on('error', (err: any) => {
        if (err.code === 'ECONNRESET' || req.destroyed) {
          // Expected when intentionally destroying stream
          resolve(buffer);
        } else {
          reject(err);
        }
      });
    });

    expect(receivedData).toContain('event: connected');
    expect(receivedData).toContain('event: order_snapshot');
    expect(receivedData).toContain(orderId);
  });

  it('broadcasts to connected clients on status transition', async () => {
    let receivedPayload: any = null;

    const mockRes: any = {
      writeHead: () => {},
      flushHeaders: () => {},
      write: (data: string) => {
        if (data.includes('event: order_updated')) {
          const jsonStr = data.split('data: ')[1]?.split('\n\n')[0];
          if (jsonStr) receivedPayload = JSON.parse(jsonStr);
        }
      },
      on: () => {},
    };

    sseService.addClient(orderId, mockRes);
    expect(sseService.getClientCount(orderId)).toBeGreaterThanOrEqual(1);

    const updateRes = await fetch(`http://127.0.0.1:${port}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    expect(updateRes.status).toBe(200);

    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.status).toBe('ACCEPTED');
  });
});
