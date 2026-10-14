'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useOrderEvents } from '@/hooks/useOrderEvents';
import { OrderTracker } from '@/components/OrderTracker';
import { AuthGate } from '@/components/AuthGate';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  return (
    <AuthGate
      title="Sign In to Track Order"
      description="Live kitchen tracking and status streaming are reserved for authenticated members. Please sign in to track this order."
    >
      <OrderTrackingContent orderId={orderId} />
    </AuthGate>
  );
}

function OrderTrackingContent({ orderId }: { orderId: string }) {
  const { order, status, error, refreshOrder } = useOrderEvents(orderId);

  if (error && !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-editorial text-[#1C1917]">
          Order Not Found
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          We couldn&apos;t find an order with identifier &ldquo;{orderId}&rdquo;. Please verify your reference number.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => refreshOrder()}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#39834B] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#19231D]">
          Connecting to Kitchen Journey Live Stream...
        </p>
        <p className="text-xs text-[#70786F]">
          Establishing Server-Sent Events stream for #{orderId}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#70786F] hover:text-[#19231D] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>

      <OrderTracker
        order={order}
        sseStatus={status}
        onRefresh={refreshOrder}
      />
    </div>
  );
}
