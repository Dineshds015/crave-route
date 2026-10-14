'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    pricing,
    totalItemCount,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const remainingForFreeDelivery = Math.max(
    0,
    Number((freeDeliveryThreshold - pricing.subtotal).toFixed(2))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E7E2D7] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#E7E2D7] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C2410C]" />
              <h2 className="text-xl font-bold text-[#1C1917] font-editorial">
                Your Basket ({totalItemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Promo banner */}
          {pricing.subtotal > 0 && (
            <div className="px-6 py-2.5 bg-[#ECFCCB] border-b border-[#D9F99D] text-xs text-[#365314] font-medium flex items-center justify-between">
              {remainingForFreeDelivery > 0 ? (
                <span>
                  Add <strong>₹{remainingForFreeDelivery.toFixed(2)}</strong> more for{' '}
                  <span className="font-bold text-[#15803D]">Free Delivery</span>!
                </span>
              ) : (
                <span className="font-bold text-[#15803D] flex items-center gap-1">
                  ✓ Free Delivery unlocked!
                </span>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F3EFE6] flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1C1917] font-editorial">
                  Your basket is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mt-1">
                  Explore our hot crispy samosas, artisan tarts, and slow-simmered curries.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.map(({ item, quantity }) => (
                <div
                  key={item._id}
                  className="p-3 bg-white rounded-xl border border-[#E7E2D7] flex items-center gap-3.5 shadow-2xs"
                >
                  <div 
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0"
                    style={{ position: 'relative' }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#1C1917] truncate font-editorial">
                      {item.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#78716C]">
                      €{item.price.toFixed(2)} each
                    </span>

                    {/* Quantity selectors */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E7E2D7] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item._id, quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-stone-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-stone-400 hover:text-red-500 transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1C1917] block">
                      ₹{(item.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Totals */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E7E2D7] space-y-4">
              <div className="space-y-1.5 text-xs text-[#57534E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{pricing.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-[#1C1917]">
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-[#15803D]">Free</span>
                    ) : (
                      `₹${pricing.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kitchen service</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{pricing.serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{pricing.tax.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-[#1C1917]">
                  <span>Total</span>
                  <span className="text-base text-[#C2410C]">
                    ₹{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4D7C0F]" />
                  <span>Trusted server-calculated pricing • No hidden fees</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
