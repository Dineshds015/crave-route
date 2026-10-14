import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrderTracker } from '@/components/OrderTracker';
import { Order, OrderStatus } from '@/types';

const mockOrder: Order = {
  _id: 'order-12345',
  orderReference: 'CR-ALPHA9',
  customer: {
    name: 'Elena Rostova',
    phone: '+49 170 5554433',
    deliveryAddress: 'Torstraße 140, Berlin',
  },
  items: [
    {
      menuItemId: 'item-101',
      name: 'Artisanal Golden Samosa',
      unitPrice: 7.5,
      quantity: 2,
      itemTotal: 15.0,
    },
  ],
  pricing: {
    subtotal: 15.0,
    deliveryFee: 3.5,
    serviceFee: 1.5,
    tax: 1.2,
    total: 21.2,
  },
  status: OrderStatus.PREPARING,
  version: 2,
  isSimulated: true,
  estimatedDeliveryMinutes: 25,
  createdAt: '2026-10-13T10:00:00.000Z',
  updatedAt: '2026-10-13T10:05:00.000Z',
  events: [
    {
      orderId: 'order-12345',
      fromStatus: null,
      toStatus: OrderStatus.RECEIVED,
      timestamp: '2026-10-13T10:00:00.000Z',
      note: 'Order placed by customer',
      source: 'CUSTOMER',
    },
    {
      orderId: 'order-12345',
      fromStatus: OrderStatus.RECEIVED,
      toStatus: OrderStatus.ACCEPTED,
      timestamp: '2026-10-13T10:02:00.000Z',
      note: 'Kitchen confirmed ticket',
      source: 'KITCHEN',
    },
    {
      orderId: 'order-12345',
      fromStatus: OrderStatus.ACCEPTED,
      toStatus: OrderStatus.PREPARING,
      timestamp: '2026-10-13T10:05:00.000Z',
      note: 'Chef began frying samosas',
      source: 'SIMULATION',
    },
  ],
  allowedTransitions: [OrderStatus.READY],
};

describe('OrderTracker Component', () => {
  it('renders order reference, current state, and live SSE badge', () => {
    render(
      <OrderTracker
        order={mockOrder}
        sseStatus="CONNECTED"
      />
    );

    expect(screen.getByText(/CR-ALPHA9/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PREPARING/i)[0]).toBeInTheDocument();
    expect(screen.getByText('LIVE SSE CONNECTED')).toBeInTheDocument();
    expect(screen.getByText('SIMULATION ACTIVE')).toBeInTheDocument();
  });

  it('renders order history timeline events', () => {
    render(
      <OrderTracker
        order={mockOrder}
        sseStatus="CONNECTED"
      />
    );

    expect(screen.getByText('Order history')).toBeInTheDocument();
    expect(screen.getByText('Chef began frying samosas')).toBeInTheDocument();
    expect(screen.getByText('Kitchen confirmed ticket')).toBeInTheDocument();
    expect(screen.getByText('Order placed by customer')).toBeInTheDocument();
  });

  it('does NOT render Cancel Order button when order is in PREPARING (cancellation forbidden)', () => {
    render(
      <OrderTracker
        order={mockOrder}
        sseStatus="CONNECTED"
      />
    );

    expect(screen.queryByText('Cancel Order')).not.toBeInTheDocument();
  });
});
