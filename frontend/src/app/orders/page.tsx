'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  Ban,
  Package,
  Smartphone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { fetchOrders } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';

const STATUS_TABS = [
  'All',
  OrderStatus.DELIVERED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.CANCELLED,
];

export default function YourOrdersPage() {
  const router = useRouter();
  const { savedOrderRefs } = useCart();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchRef, setSearchRef] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    if (isAuthenticated && user?.phone) {
      // Fetch all orders matching this user's mobile number across all devices!
      fetchOrders(undefined, undefined, user.phone)
        .then((data) => setOrders(data))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      // Unauthenticated guest: fetch saved references or recent orders
      fetchOrders(savedOrderRefs.length > 0 ? savedOrderRefs : undefined)
        .then((data) => setOrders(data))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, user?.phone, savedOrderRefs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      router.push(`/order/${encodeURIComponent(searchRef.trim().toUpperCase())}`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'All') return true;
    return order.status === selectedStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#39834B] border border-[#D1EED7]">
            Delivered
          </span>
        );
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Out for Delivery
          </span>
        );
      case OrderStatus.PREPARING:
      case OrderStatus.ACCEPTED:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {status === OrderStatus.ACCEPTED ? 'Accepted' : 'Preparing'}
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C43D36] border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AuthGate
      title="Sign In to View Orders"
      description="Your order history, kitchen updates, and live receipts are securely linked to your mobile phone number. Please sign in to view your orders across all devices."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
      {/* Header matching Screen G */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#19231D]">
            Your Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#70786F] mt-1">
            View and manage your past orders.
          </p>
        </div>

        {/* Lookup by Reference Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#70786F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. CR-XXXXXX)"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#E8E9E2] rounded-xl text-xs text-[#19231D] focus:outline-none focus:ring-2 focus:ring-[#39834B] w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {/* Auth Account Sync Banner */}
      {isAuthenticated && user ? (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#D1EED7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#183D2B]">
          <div className="flex items-center gap-2.5 font-medium">
            <UserCheck className="w-4 h-4 text-[#39834B] shrink-0" />
            <span>
              Signed in as <strong>{user.name}</strong> (<span className="font-mono">{user.phone}</span>). Showing all orders linked to your phone number across all devices.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-[#E8E9E2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#70786F]">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#39834B] shrink-0" />
            <span>
              Currently viewing orders from this device only. <strong>Sign in with your mobile number</strong> to view and sync your order history on any phone, tablet, or laptop.
            </span>
          </div>
          <button
            onClick={openLoginModal}
            className="px-3.5 py-1.5 bg-[#183D2B] hover:bg-[#2d6b3c] text-[#C8F169] font-bold rounded-xl text-xs transition shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Sign In with Mobile OTP
          </button>
        </div>
      )}

      {/* Filter Tabs matching Screen G */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab;
          const label = tab === 'All' ? 'All' : tab.replace(/_/g, ' ');

          return (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 capitalize cursor-pointer ${
                isSelected
                  ? 'bg-[#39834B] text-white shadow-xs'
                  : 'bg-white text-[#70786F] hover:bg-[#FAF9F5] border border-[#E8E9E2]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-3xl animate-pulse border border-[#E8E9E2]"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#E8E9E2] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F5] flex items-center justify-center mx-auto text-[#70786F]">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#19231D]">No orders found</h2>
          <p className="text-xs text-[#70786F] max-w-sm mx-auto">
            {selectedStatus !== 'All'
              ? `You don't have any orders with status "${selectedStatus.replace(/_/g, ' ')}".`
              : "You haven't placed any orders yet. Explore our delicious menu to get started!"}
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39834B] text-white text-xs font-semibold rounded-xl"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Menu</span>
            </Link>
          </div>
        </div>
      )}

      {/* Order Cards List matching Screen G */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const firstItemImage =
              order.items[0]?.menuItemId &&
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80';
            const totalQuantity = order.items.reduce((acc, it) => acc + it.quantity, 0);
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="p-5 bg-white rounded-3xl border border-[#E8E9E2] shadow-xs hover:border-[#D6D8CE] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details matching Screen G */}
                <div className="flex items-center gap-4">
                  <div 
                    className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF9F5] border border-[#E8E9E2] shrink-0"
                    style={{ position: 'relative' }}
                  >
                    <Image
                      src={firstItemImage}
                      alt="Order dish thumbnail"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#19231D] font-mono">
                      #{order.orderReference}
                    </h3>
                    <p className="text-xs text-[#70786F] mt-0.5">
                      {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} •{' '}
                      <strong className="text-[#19231D]">
                        ₹{order.pricing.total.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Center / Right: Status Badge & Date matching Screen G */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                  <div>{getStatusBadge(order.status)}</div>

                  <div className="text-right text-xs text-[#70786F]">
                    <span>{dateStr}</span>
                    <span className="block text-[11px] text-stone-400">{timeStr}</span>
                  </div>

                  <Link
                    href={`/order/${encodeURIComponent(order.orderReference)}/details`}
                    className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F0F2EB] border border-[#E8E9E2] text-[#19231D] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </AuthGate>
  );
}
