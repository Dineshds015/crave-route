'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  CheckCheck,
  Clock,
  Radio,
  ShieldCheck,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { fetchOrder } from '@/services/api';
import { Order } from '@/types';
import { AuthGate } from '@/components/AuthGate';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  return (
    <AuthGate
      title="Sign In to View Confirmation"
      description="Please sign in to view your order confirmation, reference code, and receipt."
    >
      <OrderConfirmationContent orderId={orderId} />
    </AuthGate>
  );
}

function OrderConfirmationContent({ orderId }: { orderId: string }) {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => setOrder(data))
      .catch(() => {});
  }, [orderId]);

  const orderReference = order?.orderReference || orderId;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8 pb-24">
      {/* Designed Checkmark Badge matching Screen E */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-[#EBF7EE] flex items-center justify-center animate-pulse-ring">
          <div className="w-16 h-16 rounded-full bg-[#39834B] flex items-center justify-center text-white shadow-lg">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Headings matching Screen E */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#19231D] tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-[#70786F] max-w-md mx-auto leading-relaxed">
          Your order has been confirmed. Track it in real-time using the order ID below.
        </p>
      </div>

      {/* Order ID Pill with Copy Action matching Screen E */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#E8E9E2] shadow-xs">
        <span className="text-xs font-semibold text-[#70786F]">Order ID</span>
        <span className="text-sm sm:text-base font-extrabold text-[#19231D] font-mono">
          #{orderReference}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-[#70786F] hover:text-[#39834B] hover:bg-stone-50 transition cursor-pointer"
          title="Copy Order Reference"
          aria-label="Copy order reference"
        >
          {copied ? (
            <CheckCheck className="w-4 h-4 text-[#39834B]" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Primary & Secondary Actions matching Screen E */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href={`/order/${encodeURIComponent(orderReference)}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href={`/order/${encodeURIComponent(orderReference)}/details`}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF9F5] text-[#19231D] border border-[#E8E9E2] text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Receipt className="w-4 h-4 text-[#70786F]" />
          <span>View Order Details</span>
        </Link>
      </div>

      {/* Metadata Chips matching Screen E */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#E8E9E2] text-left">
        <div className="p-3.5 bg-white rounded-2xl border border-[#E8E9E2] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] flex items-center justify-center text-[#39834B] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#70786F] block uppercase font-bold tracking-wider">
              Estimated Delivery
            </span>
            <span className="text-xs font-bold text-[#19231D]">
              ~{order?.estimatedDeliveryMinutes || 25} mins (Simulated)
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#E8E9E2] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EBF7EE] flex items-center justify-center text-[#39834B] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-[#70786F] block uppercase font-bold tracking-wider">
              Order Status
            </span>
            <span className="text-xs font-bold text-[#39834B]">Live Tracking Active</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#E8E9E2] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] flex items-center justify-center text-[#39834B] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#70786F] block uppercase font-bold tracking-wider">
              Payment
            </span>
            <span className="text-xs font-bold text-[#19231D]">Verified & Received</span>
          </div>
        </div>
      </div>
    </div>
  );
}
