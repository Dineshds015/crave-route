import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuItem } from '@/types';

const mockItem: MenuItem = {
  _id: 'test-item-1',
  name: 'Artisanal Golden Samosa',
  description: 'Handcrafted spiced pastry.',
  price: 200,
  currency: 'INR',
  category: 'Samosas',
  imageUrl: '/test.jpg',
  isAvailable: true,
  dietary: ['Vegetarian'],
  preparationTimeMinutes: 10,
};

function TestConsumer() {
  const { cart, addToCart, updateQuantity, removeFromCart, pricing, totalItemCount } = useCart();
  return (
    <div>
      <span data-testid="item-count">{totalItemCount}</span>
      <span data-testid="subtotal">{pricing.subtotal}</span>
      <span data-testid="total">{pricing.total}</span>
      <button onClick={() => addToCart(mockItem)}>Add Item</button>
      <button onClick={() => updateQuantity(mockItem._id, 3)}>Set Qty 3</button>
      <button onClick={() => removeFromCart(mockItem._id)}>Remove</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items, updates quantities, and calculates server-aligned totals', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');

    // Add item
    act(() => {
      screen.getByText('Add Item').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('subtotal').textContent).toBe('200');
    // Total = 200 + 49 (delivery) + 20 (service) + 10 (5% tax) = 279
    expect(screen.getByTestId('total').textContent).toBe('279');

    // Update quantity to 3
    act(() => {
      screen.getByText('Set Qty 3').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('3');
    expect(screen.getByTestId('subtotal').textContent).toBe('600');
    // Total = 600 + 0 (free delivery >= 499) + 20 (service) + 30 (5% tax) = 650
    expect(screen.getByTestId('total').textContent).toBe('650');

    // Remove item
    act(() => {
      screen.getByText('Remove').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });
});
