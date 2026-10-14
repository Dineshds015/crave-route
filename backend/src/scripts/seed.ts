import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { MenuItem } from '../models/MenuItem.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { OrderStatusEvent } from '../models/OrderStatusEvent.js';
import { defaultMenuItems, defaultSeedUsers } from '../config/seed-data.js';
import { OrderStatus } from '../services/state-machine.service.js';

export { defaultMenuItems as seedMenuItems };

export async function runSeed() {
  console.log('Seeding CraveRoute database with culinary menu and auth users...');
  await connectDB();

  // 1. Seed Menu Items
  await MenuItem.deleteMany({});
  const createdItems = await MenuItem.insertMany(defaultMenuItems);
  console.log(`Successfully seeded ${createdItems.length} delicious menu items across all categories.`);

  // 2. Seed Users with Mobile Numbers & OTP
  await User.deleteMany({});
  const usersToInsert = defaultSeedUsers.map(u => ({
    phone: u.phone.replace(/[\s\-\(\)]/g, '').trim(),
    name: u.name,
    otp: u.otp,
    otpExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for testing
  }));
  const createdUsers = await User.insertMany(usersToInsert);
  console.log(`Successfully seeded ${createdUsers.length} user accounts with OTP:`);
  createdUsers.forEach(u => console.log(` - Phone: ${u.phone} | Name: ${u.name} | OTP: ${u.otp}`));

  // 3. Seed Sample Orders for Demo Users
  await Order.deleteMany({});
  await OrderStatusEvent.deleteMany({});

  const sampleBurger = createdItems[0];
  const samplePizza = createdItems[5];
  const sampleSalad = createdItems[14];
  const sampleDrink = createdItems[22];

  const now = new Date();
  const pastOrders = [
    {
      orderReference: 'CR-9A4B2C',
      customer: {
        name: 'Dinesh Kumar',
        phone: '+919876543210',
        deliveryAddress: '402 Riverfront Enclave, Surat, Gujarat',
        notes: 'Ring bell twice',
      },
      items: [
        {
          menuItemId: sampleBurger._id,
          name: sampleBurger.name,
          unitPrice: sampleBurger.price,
          quantity: 2,
          itemTotal: sampleBurger.price * 2,
        },
        {
          menuItemId: sampleDrink._id,
          name: sampleDrink.name,
          unitPrice: sampleDrink.price,
          quantity: 2,
          itemTotal: sampleDrink.price * 2,
        },
      ],
      pricing: {
        subtotal: 676,
        deliveryFee: 0,
        serviceFee: 20,
        tax: 33.80,
        total: 729.80,
        currency: 'INR',
      },
      paymentMethod: 'UPI' as const,
      status: OrderStatus.DELIVERED,
      version: 5,
      isSimulated: false,
      estimatedDeliveryMinutes: 25,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      orderReference: 'CR-8F1E7D',
      customer: {
        name: 'Dinesh Kumar',
        phone: '+919876543210',
        deliveryAddress: '402 Riverfront Enclave, Surat, Gujarat',
        notes: 'Leave at front door',
      },
      items: [
        {
          menuItemId: samplePizza._id,
          name: samplePizza.name,
          unitPrice: samplePizza.price,
          quantity: 1,
          itemTotal: samplePizza.price,
        },
        {
          menuItemId: sampleSalad._id,
          name: sampleSalad.name,
          unitPrice: sampleSalad.price,
          quantity: 1,
          itemTotal: sampleSalad.price,
        },
      ],
      pricing: {
        subtotal: 648,
        deliveryFee: 0,
        serviceFee: 20,
        tax: 32.40,
        total: 700.40,
        currency: 'INR',
      },
      paymentMethod: 'CASH_ON_DELIVERY' as const,
      status: OrderStatus.PREPARING,
      version: 2,
      isSimulated: true,
      estimatedDeliveryMinutes: 20,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
    {
      orderReference: 'CR-3K8J4L',
      customer: {
        name: 'Alex Chen',
        phone: '+911111111111',
        deliveryAddress: '12 Cyber Park, Bengaluru',
        notes: 'Hand over to security if not answering',
      },
      items: [
        {
          menuItemId: sampleBurger._id,
          name: sampleBurger.name,
          unitPrice: sampleBurger.price,
          quantity: 1,
          itemTotal: sampleBurger.price,
        },
      ],
      pricing: {
        subtotal: 249,
        deliveryFee: 49,
        serviceFee: 20,
        tax: 12.45,
        total: 330.45,
        currency: 'INR',
      },
      paymentMethod: 'UPI' as const,
      status: OrderStatus.OUT_FOR_DELIVERY,
      version: 4,
      isSimulated: false,
      estimatedDeliveryMinutes: 10,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ];

  for (const po of pastOrders) {
    const saved = await Order.create(po);
    await OrderStatusEvent.create({
      orderId: saved._id,
      fromStatus: null,
      toStatus: OrderStatus.RECEIVED,
      note: 'Order confirmed and registered by customer',
      source: 'CUSTOMER',
      timestamp: new Date(po.createdAt.getTime()),
    });
    if (po.status !== OrderStatus.RECEIVED) {
      await OrderStatusEvent.create({
        orderId: saved._id,
        fromStatus: OrderStatus.RECEIVED,
        toStatus: po.status,
        note: `Order advanced to ${po.status}`,
        source: 'KITCHEN',
        timestamp: new Date(),
      });
    }
  }
  console.log(`Successfully seeded ${pastOrders.length} sample demo orders.`);

  await disconnectDB();
  console.log('Seed completed successfully.');
}

const isDirectRun = process.argv[1]?.replace(/\\/g, '/').endsWith('seed.ts') || process.argv[1]?.replace(/\\/g, '/').endsWith('seed.js');
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  runSeed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
