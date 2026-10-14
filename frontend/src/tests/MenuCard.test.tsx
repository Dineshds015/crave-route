import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MenuCard } from '@/components/MenuCard';
import { CartProvider } from '@/context/CartContext';
import { MenuItem } from '@/types';

const availableItem: MenuItem = {
  _id: 'item-101',
  name: 'Truffle Samosa',
  description: 'Crisp pastry with wild truffle cream.',
  price: 199,
  currency: 'INR',
  category: 'Starters',
  imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
  isAvailable: true,
  dietary: ['Signature', 'Vegetarian'],
  preparationTimeMinutes: 12,
};

const soldOutItem: MenuItem = {
  _id: 'item-102',
  name: 'Venison Dumpling',
  description: 'Smoked venison confit.',
  price: 349,
  currency: 'INR',
  category: 'Mains',
  imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500',
  isAvailable: false,
  dietary: ['Limited Edition'],
  preparationTimeMinutes: 20,
};

describe('MenuCard Component', () => {
  it('renders available item with name, price, dietary tags, and enables adding to cart', () => {
    render(
      <CartProvider>
        <MenuCard item={availableItem} />
      </CartProvider>
    );

    expect(screen.getByText('Truffle Samosa')).toBeInTheDocument();
    expect(screen.getByText('₹199.00')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /add/i });
    expect(addBtn).toBeEnabled();
    fireEvent.click(addBtn);

    // Quantity selector should appear
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders sold out item with Sold Out overlay and disabled action', () => {
    render(
      <CartProvider>
        <MenuCard item={soldOutItem} />
      </CartProvider>
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
    const disabledBtn = screen.getByRole('button', { name: /unavailable/i });
    expect(disabledBtn).toBeDisabled();
  });
});
