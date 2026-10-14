'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  Truck,
  PackageCheck,
  ChefHat,
  AlertCircle,
  Bot,
  RotateCw,
  Ban,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Radio,
  Navigation,
  Navigation2,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { EventTimeline } from '@/components/EventTimeline';
import { SSEConnectionStatus } from '@/hooks/useOrderEvents';
import { transitionOrderStatus, triggerSimulation } from '@/services/api';

const STAGES: { status: OrderStatus; label: string; icon: any }[] = [
  { status: OrderStatus.RECEIVED, label: 'Order Received', icon: Clock },
  { status: OrderStatus.ACCEPTED, label: 'Accepted', icon: Check },
  { status: OrderStatus.PREPARING, label: 'Preparing', icon: ChefHat },
  { status: OrderStatus.READY, label: 'Ready', icon: PackageCheck },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: Truck },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: Check },
];

export function OrderTracker({
  order,
  sseStatus,
  onRefresh,
}: {
  order: Order;
  sseStatus: SSEConnectionStatus;
  onRefresh?: () => void;
}) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCancelled = order.status === OrderStatus.CANCELLED;
  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);

  // Determine stage progress percentage
  const progressPercent = isCancelled
    ? 0
    : currentStageIndex >= 0
    ? (currentStageIndex / (STAGES.length - 1)) * 100
    : 0;

  const allowedTransitions = order.allowedTransitions || [];
  const canCancel = allowedTransitions.includes(OrderStatus.CANCELLED);
  const nextStage = STAGES[currentStageIndex + 1]?.status;
  const canAdvance = nextStage && allowedTransitions.includes(nextStage);

  const handleAdvance = async () => {
    if (!canAdvance || !nextStage) return;
    setIsAdvancing(true);
    setActionError(null);
    try {
      await transitionOrderStatus(order._id, nextStage, undefined, order.version);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to advance stage');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleCancel = async () => {
    if (!canCancel) return;
    const confirm = window.confirm(
      'Are you sure you wish to cancel this order? This action is irreversible.'
    );
    if (!confirm) return;

    setActionError(null);
    try {
      await transitionOrderStatus(
        order._id,
        OrderStatus.CANCELLED,
        'Cancelled by customer request',
        order.version
      );
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel order');
    }
  };

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    setActionError(null);
    try {
      await triggerSimulation(order._id, 3500);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err.message || 'Failed to trigger simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const getConnectionBadge = () => {
    switch (sseStatus) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#39834B] border border-[#D1EED7]">
            <Radio className="w-3.5 h-3.5 text-[#39834B] animate-pulse" />
            <span>LIVE SSE CONNECTED</span>
          </span>
        );
      case 'RECONNECTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>RECONNECTING...</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            <Radio className="w-3.5 h-3.5 text-stone-400" />
            <span>CONNECTING</span>
          </span>
        );
    }
  };

  // Find timestamps for completed stages if available in events
  const getStageTime = (stageStatus: OrderStatus) => {
    const evt = order.events?.find((e) => e.toStatus === stageStatus);
    if (evt) {
      return new Date(evt.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Back button matching Screen F */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70786F] hover:text-[#19231D] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
        <Link
          href={`/order/${encodeURIComponent(order.orderReference)}/details`}
          className="text-xs font-semibold text-[#39834B] hover:underline"
        >
          View Full Order Details →
        </Link>
      </div>

      {/* Top Header Card matching Screen F */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0F2EB]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#19231D]">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#70786F] mt-1 font-mono font-bold">
              Order ID: #{order.orderReference}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            {getConnectionBadge()}
            {order.isSimulated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#C8F169]/30 text-[#183D2B] text-[10px] font-bold">
                <Bot className="w-3 h-3 text-[#39834B]" />
                SIMULATION ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Progress Stepper matching Screen F */}
        {!isCancelled && (
          <div className="py-2 px-2 sm:px-6">
            <div className="relative">
              {/* Background Bar */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0" />

              {/* Active Filled Bar */}
              <div
                className="absolute top-4 left-6 h-1 bg-[#39834B] transition-all duration-700 -z-0"
                style={{ width: `calc(${progressPercent}% * 0.92)` }}
              />

              {/* Step checkpoints */}
              <div className="relative z-10 flex justify-between">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const isPending = idx > currentStageIndex;
                  const stageTime = getStageTime(stage.status);

                  return (
                    <div
                      key={stage.status}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#39834B] text-white shadow-xs'
                            : isCurrent
                            ? 'bg-[#39834B] text-white ring-4 ring-[#EBF7EE] scale-110 shadow-sm'
                            : 'bg-white border-2 border-stone-300 text-stone-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="text-[11px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <span
                        className={`mt-2 text-[11px] sm:text-xs font-bold max-w-[70px] sm:max-w-none ${
                          isCurrent
                            ? 'text-[#19231D]'
                            : isCompleted
                            ? 'text-stone-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {stage.label}
                      </span>

                      <span className="text-[10px] text-[#70786F] mt-0.5">
                        {isCompleted && stageTime
                          ? stageTime
                          : isCurrent
                          ? stageTime || 'In Progress'
                          : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Alert Banner */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#C43D36] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This order was cancelled and its preparation halted.</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#C43D36] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Screen F: Live Map Card on Left & Order Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Simulated Live Route Map Card matching Screen F */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39834B] animate-pulse" />
              <h2 className="text-sm font-bold text-[#19231D]">Live Location</h2>
            </div>
            <span className="text-[11px] text-[#70786F] font-mono">
              GPS Simulation Active
            </span>
          </div>

          {/* Map Vector Graphic Card matching Screen F */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#F4F6F0] border border-[#E8E9E2] flex items-center justify-center">
            {/* Grid Map Vector lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#E2E5DC"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Delivery route road path matching Screen F */}
              <path
                d="M 60 220 L 160 180 L 260 120 L 320 60"
                fill="none"
                stroke="#39834B"
                strokeWidth="4"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Courier Marker moving on route matching Screen F */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center animate-bounce">
              <div className="w-12 h-12 rounded-full bg-[#183D2B] text-[#C8F169] border-2 border-white shadow-lg flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
            </div>

            {/* Destination Marker */}
            <div className="absolute top-12 right-16 z-10 text-center">
              <div className="w-8 h-8 rounded-full bg-[#C43D36] text-white border-2 border-white shadow-md flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            {/* Dynamic Courier Status Pill matching Screen F */}
            <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#E8E9E2] shadow-sm text-left">
              <div className="text-xs font-bold text-[#19231D]">
                {order.status === OrderStatus.OUT_FOR_DELIVERY
                  ? 'Courier is 2.3 km away'
                  : order.status === OrderStatus.DELIVERED
                  ? 'Order Handed Over'
                  : 'Preparing for Dispatch'}
              </div>
              <div className="text-[11px] text-[#70786F]">
                {order.status === OrderStatus.OUT_FOR_DELIVERY
                  ? 'Arriving in ~8 mins'
                  : order.status === OrderStatus.DELIVERED
                  ? 'Delivered to your door'
                  : 'Kitchen packaging fresh items'}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#70786F]">
            <span>Delivery Address: <strong>{order.customer.deliveryAddress}</strong></span>
          </div>
        </div>

        {/* Right Column: Order Timeline matching Screen F */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-6">
          <EventTimeline
            events={order.events || []}
            currentStatus={order.status}
          />

          {/* Technical Assessment Controls */}
          <div className="pt-6 border-t border-[#F0F2EB] space-y-3">
            <span className="text-[11px] font-bold text-[#70786F] uppercase tracking-wider block">
              Assessment Evaluation Controls
            </span>

            <div className="flex flex-wrap gap-2">
              {canAdvance && (
                <button
                  onClick={handleAdvance}
                  disabled={isAdvancing}
                  className="px-3.5 py-2 bg-[#183D2B] hover:bg-[#19231D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {!isCancelled && order.status !== OrderStatus.DELIVERED && (
                <button
                  onClick={handleTriggerSimulation}
                  disabled={isSimulating}
                  className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#F0F2EB] border border-[#E8E9E2] text-[#19231D] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#39834B]" />
                  <span>Run 4s Simulation</span>
                </button>
              )}

              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="px-3.5 py-2 bg-white hover:bg-red-50 border border-red-200 text-[#C43D36] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ml-auto cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
