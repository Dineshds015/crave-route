'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem, CartItem, OrderPricing } from '@/types';
import { fetchMenu } from '@/services/api';

interface ToastData {
  id: string;
  message: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItemCount: number;
  pricing: OrderPricing;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toast: ToastData | null;
  showToast: (message: string) => void;
  savedOrderRefs: string[];
  addOrderRef: (ref: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [savedOrderRefs, setSavedOrderRefs] = useState<string[]>([]);

  // Load from localStorage on client mount & reconcile with live menu
  useEffect(() => {
    try {
      const saved = localStorage.getItem('craveroute_cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        setCart(parsed);

        // Fetch live menu from active backend to synchronize IDs in case DB was re-seeded
        fetchMenu()
          .then((liveMenu) => {
            if (liveMenu && liveMenu.length > 0) {
              setCart((prev) => {
                const reconciled: CartItem[] = [];
                for (const ci of prev) {
                  const match = liveMenu.find(
                    (m) =>
                      m._id === ci.item._id ||
                      m.name.trim().toLowerCase() === ci.item.name.trim().toLowerCase()
                  );
                  if (match && match.isAvailable) {
                    reconciled.push({
                      item: match,
                      quantity: ci.quantity,
                    });
                  }
                }
                return reconciled;
              });
            }
          })
          .catch(() => {
            // Keep existing cart if offline
          });
      }
      const savedRefs = localStorage.getItem('craveroute_recent_orders');
      if (savedRefs) {
        setSavedOrderRefs(JSON.parse(savedRefs));
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('craveroute_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart, isHydrated]);

  const showToast = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 3200);
  }, []);

  const addOrderRef = useCallback((ref: string) => {
    setSavedOrderRefs(prev => {
      const updated = [ref, ...prev.filter(r => r !== ref)].slice(0, 20);
      try {
        localStorage.setItem('craveroute_recent_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addToCart = (item: MenuItem, quantity = 1) => {
    if (!item.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.item._id === item._id);
      if (existing) {
        return prev.map(ci =>
          ci.item._id === item._id
            ? { ...ci, quantity: Math.min(20, ci.quantity + quantity) }
            : ci
        );
      }
      return [...prev, { item, quantity: Math.min(20, quantity) }];
    });
    showToast(`Added ${quantity > 1 ? `${quantity}x ` : ''}${item.name} to cart`);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(ci =>
        ci.item._id === itemId ? { ...ci, quantity: Math.min(20, quantity) } : ci
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item._id !== itemId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);

  // Trusted pricing calculations mirroring backend rules (INR)
  const subtotal = Number(
    cart
      .reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0)
      .toFixed(2)
  );
  const deliveryFee = subtotal > 0 ? (subtotal >= 499 ? 0 : 49) : 0;
  const serviceFee = subtotal > 0 ? 20 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + deliveryFee + serviceFee + tax).toFixed(2));

  const pricing: OrderPricing = {
    subtotal,
    deliveryFee,
    serviceFee,
    tax,
    total,
    currency: 'INR',
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
        pricing,
        isCartOpen,
        setIsCartOpen,
        toast,
        showToast,
        savedOrderRefs,
        addOrderRef,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
