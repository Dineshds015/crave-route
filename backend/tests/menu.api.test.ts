import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';

describe('Menu API', () => {
  beforeEach(async () => {
    await MenuItem.create([
      {
        name: 'Artisanal Truffle Samosa',
        description: 'Crisp pastry shell filled with spiced potato and black truffle oil.',
        price: 8.5,
        category: 'Starters',
        imageUrl: '/images/truffle-samosa.jpg',
        isAvailable: true,
        dietary: ['Vegetarian'],
        preparationTimeMinutes: 12,
      },
      {
        name: 'Slow-Cooked Lamb Dumpling',
        description: 'Tender braised lamb with aromatic cardamom and mint glaze.',
        price: 14.0,
        category: 'Mains',
        imageUrl: '/images/lamb-dumpling.jpg',
        isAvailable: false, // out of stock
        dietary: [],
        preparationTimeMinutes: 20,
      },
    ]);
  });

  it('GET /api/menu returns all menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/menu?availableOnly=true returns only available items', async () => {
    const res = await request(app).get('/api/menu?availableOnly=true');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Artisanal Truffle Samosa');
  });

  it('GET /api/menu/:id returns specific item or 404', async () => {
    const item = await MenuItem.findOne({ name: 'Artisanal Truffle Samosa' });
    const res = await request(app).get(`/api/menu/${item!._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Artisanal Truffle Samosa');

    const notFoundRes = await request(app).get('/api/menu/507f1f77bcf86cd799439011');
    expect(notFoundRes.status).toBe(404);
  });
});
