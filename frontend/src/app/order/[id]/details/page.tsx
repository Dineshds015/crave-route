'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { fetchOrder } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { EventTimeline } from '@/components/EventTimeline';
import { AuthGate } from '@/components/AuthGate';

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  return (
    <AuthGate
      title="Sign In to View Order Details"
      description="Itemized receipts, payment breakdowns, and preparation timelines are reserved for authenticated members. Please sign in to view details."
    >
      <OrderDetailsContent orderId={orderId} />
    </AuthGate>
  );
}

function OrderDetailsContent({ orderId }: { orderId: string }) {

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || 'Order not found'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#39834B] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#70786F]">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#C43D36] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#19231D]">Order Not Found</h2>
        <p className="text-xs text-[#70786F]">
          We could not find an order matching identifier &ldquo;{orderId}&rdquo;.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39834B] text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#39834B] border border-[#D1EED7]">
            Delivered
          </span>
        );
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Out for Delivery
          </span>
        );
      case OrderStatus.PREPARING:
      case OrderStatus.ACCEPTED:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {status === OrderStatus.ACCEPTED ? 'Accepted' : 'Preparing'}
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-[#C43D36] border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
      {/* Back button matching Screen H */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70786F] hover:text-[#19231D] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>

      {/* Header matching Screen H */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E2]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#19231D]">
            Order Details
          </h1>
          <span className="text-xs font-mono font-bold text-[#70786F] mt-0.5 block">
            #{order.orderReference}
          </span>
        </div>

        <div>{getStatusBadge(order.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items Ordered matching Screen H */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#19231D] pb-3 border-b border-[#F0F2EB]">
            Items Ordered
          </h2>

          <div className="divide-y divide-[#F0F2EB]">
            {order.items.map((line, idx) => (
              <div
                key={idx}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div 
                    className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF9F5] border border-[#E8E9E2] shrink-0"
                    style={{ position: 'relative' }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80"
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#19231D] truncate">
                      {line.name}
                    </h3>
                    <span className="text-xs text-[#70786F]">
                      ₹{line.unitPrice.toFixed(2)} &times; {line.quantity}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-bold text-[#19231D] shrink-0">
                  ₹{line.itemTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F0F2EB] space-y-2 text-xs sm:text-sm text-[#70786F]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#19231D]">
                ₹{order.pricing.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-[#19231D]">
                {order.pricing.deliveryFee === 0 ? (
                  <span className="text-[#39834B] font-bold">Free</span>
                ) : (
                  `₹${order.pricing.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-[#F0F2EB] flex justify-between text-base sm:text-lg font-bold text-[#19231D]">
              <span>Total</span>
              <span className="text-[#39834B]">₹{order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Info & Timeline matching Screen H */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Information Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#19231D] pb-3 border-b border-[#F0F2EB]">
              Delivery Information
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#70786F] shrink-0" />
                <span className="font-semibold text-[#19231D]">
                  {order.customer.name}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#70786F] shrink-0" />
                <span className="text-[#70786F]">{order.customer.phone}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#70786F] shrink-0 mt-0.5" />
                <span className="text-[#70786F]">
                  {order.customer.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/order/${encodeURIComponent(order.orderReference)}`}
                className="w-full py-3 px-4 bg-[#EBF7EE] hover:bg-[#D1EED7] text-[#39834B] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>Track Order Live</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Order Timeline Card matching Screen H */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-4">
            <EventTimeline
              events={order.events || []}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
