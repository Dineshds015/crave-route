'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2 } from 'lucide-react';

export function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#183D2B] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#39834B]/30 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="w-6 h-6 rounded-full bg-[#C8F169] text-[#183D2B] flex items-center justify-center shrink-0 font-bold">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <span>{toast.message}</span>
    </div>
  );
}
