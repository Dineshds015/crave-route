'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/api';
import { AuthGate } from '@/components/AuthGate';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, pricing, clearCart, addOrderRef } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressTag, setAddressTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'UPI' | 'CARD'>('CASH_ON_DELIVERY');
  const [isSimulated, setIsSimulated] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Generate unique idempotency key per checkout attempt
  const [idempotencyKey, setIdempotencyKey] = useState('');

  useEffect(() => {
    setIdempotencyKey(
      `checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    );
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && user.name !== 'CraveRoute Guest') {
        setName((prev) => prev || user.name);
      }
      if (user.phone) {
        setPhone((prev) => prev || user.phone);
      }
    }
  }, [isAuthenticated, user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters long';
    }
    if (!phone.trim() || phone.trim().length < 8) {
      errs.phone = 'Valid phone number is required';
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      errs.deliveryAddress = 'Delivery address must be at least 5 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const fullAddress = addressTag !== 'Other' ? `[${addressTag}] ${deliveryAddress.trim()}` : deliveryAddress.trim();
      const payload = {
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          deliveryAddress: fullAddress,
          notes: notes.trim(),
        },
        items: cart.map((ci) => ({
          menuItemId: ci.item._id,
          quantity: ci.quantity,
        })),
        paymentMethod,
        idempotencyKey,
        isSimulated,
      };

      const newOrder = await createOrder(payload);

      // Save reference to customer's browser history
      addOrderRef(newOrder.orderReference);

      // Clear shopping basket
      clearCart();

      // Redirect to Confirmation screen (Screen E)
      router.push(`/order/${encodeURIComponent(newOrder.orderReference)}/confirmation`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGate
      title="Sign In to Checkout"
      description="Please sign in with your mobile phone number to configure your delivery address, select a payment method, and complete your order."
      actionLabel="Sign In with Mobile OTP"
    >
      {cart.length === 0 ? (
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white border border-[#E8E9E2] flex items-center justify-center mx-auto text-[#70786F]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#19231D]">Your cart is empty</h2>
          <p className="text-xs text-[#70786F]">Add dishes to your cart before proceeding to checkout.</p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39834B] text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
          {/* Back button */}
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70786F] hover:text-[#19231D] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#19231D]">Checkout</h1>
            <p className="text-xs sm:text-sm text-[#70786F] mt-1">
              Confirm your delivery address, select payment, and place your order.
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#C43D36] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {submitError.includes('does not exist')
                    ? 'Your cart contained items from a previous database session. Please refresh your cart to checkout with the new menu.'
                    : submitError}
                </span>
              </div>
              {submitError.includes('does not exist') && (
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    router.push('/menu');
                  }}
                  className="px-3.5 py-1.5 bg-[#C43D36] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Reset Cart & Browse Menu
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Delivery Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E9E2] shadow-xs space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Contact Info */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-[#19231D] uppercase tracking-wider text-[#39834B]">
                    1. Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dinesh Kumar"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`w-full px-4 py-2.5 bg-[#FAF9F5] border rounded-xl text-xs sm:text-sm text-[#19231D] placeholder-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] ${
                          errors.name ? 'border-[#C43D36] bg-red-50/50' : 'border-[#E8E9E2]'
                        }`}
                      />
                      {errors.name && (
                        <span className="text-[11px] text-[#C43D36] mt-1 block">{errors.name}</span>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className={`w-full px-4 py-2.5 bg-[#FAF9F5] border rounded-xl text-xs sm:text-sm text-[#19231D] placeholder-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] ${
                          errors.phone ? 'border-[#C43D36] bg-red-50/50' : 'border-[#E8E9E2]'
                        }`}
                      />
                      {errors.phone && (
                        <span className="text-[11px] text-[#C43D36] mt-1 block">{errors.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="space-y-4 pt-4 border-t border-[#F0F2EB]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#19231D] uppercase tracking-wider text-[#39834B]">
                      2. Delivery Address
                    </h2>
                    {/* Address Tag Selector */}
                    <div className="flex items-center gap-1.5">
                      {(['Home', 'Work', 'Other'] as const).map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setAddressTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            addressTag === tag
                              ? 'bg-[#183D2B] text-[#C8F169]'
                              : 'bg-[#FAF9F5] text-[#70786F] hover:text-[#19231D] border border-[#E8E9E2]'
                          }`}
                        >
                          {tag === 'Home' && <Home className="w-3 h-3" />}
                          {tag === 'Work' && <Building2 className="w-3 h-3" />}
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                      Street Address & Landmark *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 402 Riverfront Enclave, Ring Road, Surat, Gujarat"
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: '' });
                        }}
                        className={`w-full pl-4 pr-10 py-2.5 bg-[#FAF9F5] border rounded-xl text-xs sm:text-sm text-[#19231D] placeholder-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] ${
                          errors.deliveryAddress ? 'border-[#C43D36] bg-red-50/50' : 'border-[#E8E9E2]'
                        }`}
                      />
                      <MapPin className="w-4 h-4 text-[#70786F] absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.deliveryAddress && (
                      <span className="text-[11px] text-[#C43D36] mt-1 block">
                        {errors.deliveryAddress}
                      </span>
                    )}
                  </div>

                  {/* Special Delivery Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                      Delivery Instructions & Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ring bell twice, leave with security guard, gate code #402"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl text-xs sm:text-sm text-[#19231D] placeholder-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] resize-none"
                    />
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="space-y-3 pt-4 border-t border-[#F0F2EB]">
                  <h2 className="text-sm font-bold text-[#19231D] uppercase tracking-wider text-[#39834B]">
                    3. Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'border-[#39834B] bg-[#39834B]/10 text-[#183D2B] ring-1 ring-[#39834B]'
                          : 'border-[#E8E9E2] hover:bg-[#FAF9F5] text-[#19231D]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Banknote className="w-5 h-5 text-[#39834B]" />
                        {paymentMethod === 'CASH_ON_DELIVERY' && (
                          <CheckCircle2 className="w-4 h-4 text-[#39834B]" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Cash on Delivery</span>
                        <span className="text-[10px] text-[#70786F] block mt-0.5">Pay upon courier arrival</span>
                      </div>
                    </div>

                    {/* Instant UPI / QR */}
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                        paymentMethod === 'UPI'
                          ? 'border-[#39834B] bg-[#39834B]/10 text-[#183D2B] ring-1 ring-[#39834B]'
                          : 'border-[#E8E9E2] hover:bg-[#FAF9F5] text-[#19231D]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <QrCode className="w-5 h-5 text-[#39834B]" />
                        {paymentMethod === 'UPI' && (
                          <CheckCircle2 className="w-4 h-4 text-[#39834B]" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">UPI / QR Code</span>
                        <span className="text-[10px] text-[#70786F] block mt-0.5">GPay, PhonePe, Paytm</span>
                      </div>
                    </div>

                    {/* Credit / Debit Card */}
                    <div
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                        paymentMethod === 'CARD'
                          ? 'border-[#39834B] bg-[#39834B]/10 text-[#183D2B] ring-1 ring-[#39834B]'
                          : 'border-[#E8E9E2] hover:bg-[#FAF9F5] text-[#19231D]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-5 h-5 text-[#39834B]" />
                        {paymentMethod === 'CARD' && (
                          <CheckCircle2 className="w-4 h-4 text-[#39834B]" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Credit / Debit Card</span>
                        <span className="text-[10px] text-[#70786F] block mt-0.5">Visa, Mastercard, RuPay</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation Worker Toggle */}
                <div className="p-3.5 bg-[#EBF7EE] border border-[#D1EED7] rounded-2xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="sim-checkbox"
                    checked={isSimulated}
                    onChange={(e) => setIsSimulated(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#39834B] cursor-pointer"
                  />
                  <label htmlFor="sim-checkbox" className="text-xs cursor-pointer">
                    <span className="font-bold text-[#183D2B] block">
                      Live Kitchen Journey Simulation
                    </span>
                    <span className="text-[#70786F] text-[11px] block mt-0.5">
                      Automatically steps through order stages (Received → Accepted → Preparing → Ready → Out for Delivery → Delivered).
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-[#39834B] hover:bg-[#183D2B] text-white font-bold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Placing Order with {paymentMethod.replace(/_/g, ' ')}...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Place Order (${pricing.total.toFixed(2)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-[#70786F]">
                  Your information is secured with 256-bit encryption. No charge until delivery.
                </p>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E8E9E2] shadow-xs space-y-6 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-[#19231D] pb-3 border-b border-[#F0F2EB]">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#F0F2EB] max-h-72 overflow-y-auto pr-1">
                {cart.map(({ item, quantity }) => (
                  <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#19231D] block">{item.name}</span>
                      <span className="text-[#70786F]">
                        ₹{item.price.toFixed(2)} &times; {quantity}
                      </span>
                    </div>
                    <span className="font-bold text-[#19231D]">
                      ₹{(item.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Method Badge */}
              <div className="p-3 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#70786F]">Payment Method</span>
                <span className="font-bold text-[#183D2B] capitalize">
                  {paymentMethod.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-[#F0F2EB] text-xs">
                <div className="flex justify-between text-[#70786F]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#19231D]">
                    ₹{pricing.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#70786F]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[#19231D]">
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-[#39834B] font-bold">FREE</span>
                    ) : (
                      `₹${pricing.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#70786F]">
                  <span>Service Fee</span>
                  <span className="font-semibold text-[#19231D]">
                    ₹{pricing.serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#70786F]">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-[#19231D]">
                    ₹{pricing.tax.toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#F0F2EB] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#19231D]">Total</span>
                  <span className="text-xl font-extrabold text-[#39834B]">
                    ₹{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F2EB] flex items-center justify-center gap-2 text-xs text-[#70786F]">
                <ShieldCheck className="w-4 h-4 text-[#39834B]" />
                <span>Encrypted & Protected by CraveRoute</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
