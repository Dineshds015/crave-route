'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';

export function MenuCard({
  item,
  badgeText,
}: {
  item: MenuItem;
  badgeText?: string;
}) {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartEntry = cart.find((ci) => ci.item._id === item._id);
  const currentQuantity = cartEntry ? cartEntry.quantity : 0;

  const displayBadge =
    badgeText || (item.dietary && item.dietary.length > 0 ? item.dietary[0] : undefined);

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E9E2] transition-all duration-300 hover:shadow-lg hover:border-[#D6D8CE] ${
        !item.isAvailable ? 'opacity-80' : ''
      }`}
    >
      {/* Food Imagery */}
      <div 
        className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#FAF9F5]"
        style={{ position: 'relative' }}
      >
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Promo / Dietary Badge */}
        {displayBadge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs uppercase tracking-wider ${
                displayBadge.includes('OFF')
                  ? 'bg-[#C8F169] text-[#183D2B]'
                  : 'bg-white/95 text-[#19231D] border border-black/5'
              }`}
            >
              {displayBadge}
            </span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-[#C43D36] text-white text-xs font-bold uppercase tracking-wider shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#19231D] leading-snug group-hover:text-[#39834B] transition-colors">
            {item.name}
          </h3>
          <p className="mt-1.5 text-xs text-[#70786F] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
          <span className="text-base font-bold text-[#19231D]">
            ₹{item.price.toFixed(2)}
          </span>

          <div>
            {!item.isAvailable ? (
              <button
                disabled
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              >
                Unavailable
              </button>
            ) : currentQuantity > 0 ? (
              <div className="flex items-center gap-2 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(item._id, currentQuantity - 1)}
                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#19231D] hover:bg-stone-100 transition shadow-2xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#19231D]">
                  {currentQuantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, currentQuantity + 1)}
                  className="w-6 h-6 rounded-lg bg-[#39834B] flex items-center justify-center text-white hover:bg-[#183D2B] transition shadow-2xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(item)}
                id={`add-to-cart-${item._id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#39834B] hover:bg-[#183D2B] text-white text-xs font-semibold transition-all duration-200 hover:scale-[1.02] shadow-xs cursor-pointer"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
