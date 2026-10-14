'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Minus, X, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, pricing, totalItemCount } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white border border-[#E8E9E2] flex items-center justify-center mx-auto text-[#70786F] shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#19231D]">Your cart is empty</h1>
        <p className="text-xs text-[#70786F] max-w-sm mx-auto">
          Explore our menu and add your favorite burgers, pizzas, and pastas to get started.
        </p>
        <div className="pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
      {/* Header matching Screen C */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E2]">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#19231D]">Your Cart</h1>
          <span className="text-xs text-[#70786F]">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-[#C43D36] hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List matching Screen C */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-5">
          <div className="divide-y divide-[#F0F2EB]">
            {cart.map(({ item, quantity }) => (
              <div
                key={item._id}
                className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 sm:gap-6"
              >
                {/* Product Thumbnail */}
                <div 
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF9F5] border border-[#E8E9E2] shrink-0"
                  style={{ position: 'relative' }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Dish Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#19231D] truncate">
                    {item.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#70786F]">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Quantity Controls Stepper matching Screen C [-] 1 [+] */}
                <div className="flex items-center gap-2 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item._id, quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#19231D] hover:bg-stone-100 transition shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-[#19231D]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-[#39834B] flex items-center justify-center text-white hover:bg-[#183D2B] transition shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Item Line Total */}
                <div className="text-right min-w-[60px]">
                  <span className="text-sm sm:text-base font-bold text-[#19231D]">
                    ${(item.price * quantity).toFixed(2)}
                  </span>
                </div>

                {/* Remove action */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1.5 text-[#70786F] hover:text-[#C43D36] transition cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F0F2EB] flex justify-between items-center text-xs text-[#70786F]">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 font-semibold text-[#39834B] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card matching Screen C */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#19231D] pb-3 border-b border-[#F0F2EB]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-[#70786F]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#19231D]">
                ₹{pricing.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-[#19231D]">
                {pricing.deliveryFee === 0 ? (
                  <span className="text-[#39834B] font-bold">Free</span>
                ) : (
                  `₹${pricing.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-[#F0F2EB] flex justify-between text-base sm:text-lg font-bold text-[#19231D]">
              <span>Total</span>
              <span className="text-[#39834B]">₹{pricing.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 bg-[#39834B] hover:bg-[#183D2B] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={openLoginModal}
                className="w-full py-3.5 px-6 bg-[#183D2B] hover:bg-[#2d6b3c] text-[#C8F169] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Sign In to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#70786F] pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39834B]" />
            <span>Trusted server calculations • No hidden charges</span>
          </div>
        </div>
      </div>
    </div>
  );
}
