'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Leaf,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  QrCode,
  CreditCard,
  Banknote,
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-white border-t border-[#E8E9E2] mt-auto text-[#19231D]">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand & Contact Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#183D2B] flex items-center justify-center text-[#C8F169] transition-transform group-hover:scale-105 shadow-xs">
                <Leaf className="w-5 h-5 fill-[#C8F169]" />
              </div>
              <span className="text-xl font-extrabold text-[#19231D] tracking-tight">
                Crave<span className="text-[#39834B]">Route</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#70786F] leading-relaxed max-w-sm">
              Artisan culinary dining delivered right to your doorstep. Fresh farm-to-table
              ingredients, live kitchen journey tracking, and contactless swift delivery.
            </p>

            {/* Quick Contact & Hours */}
            <div className="space-y-2.5 text-xs text-[#70786F] pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#39834B] shrink-0" />
                <span>Open Daily: 11:00 AM – 11:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#39834B] shrink-0" />
                <span>Customer Care: +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#39834B] shrink-0" />
                <span>Assistance: support@craveroute.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#39834B] shrink-0 mt-0.5" />
                <span>Delivering in Surat, Ahmedabad, Mumbai, Bengaluru & across India</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E9E2] flex items-center justify-center text-[#70786F] hover:text-[#E1306C] hover:border-[#E1306C]/40 transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E9E2] flex items-center justify-center text-[#70786F] hover:text-[#19231D] hover:border-[#19231D]/40 transition"
                aria-label="X / Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E9E2] flex items-center justify-center text-[#70786F] hover:text-[#1877F2] hover:border-[#1877F2]/40 transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E9E2] flex items-center justify-center text-[#70786F] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E9E2] flex items-center justify-center text-[#70786F] hover:text-[#FF0000] hover:border-[#FF0000]/40 transition"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore Menu */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#19231D]">
              Explore Menu
            </h4>
            <ul className="space-y-2 text-xs text-[#70786F]">
              <li>
                <Link href="/menu?category=Burgers" className="hover:text-[#39834B] transition">
                  Artisan Burgers
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Pizzas" className="hover:text-[#39834B] transition">
                  Sourdough Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Pasta" className="hover:text-[#39834B] transition">
                  Italian Pasta
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Salads" className="hover:text-[#39834B] transition">
                  Crisp Harvest Bowls
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Starters" className="hover:text-[#39834B] transition">
                  Handcrafted Starters
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Desserts" className="hover:text-[#39834B] transition">
                  Desserts & Drinks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#19231D]">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-[#70786F]">
              <li>
                <Link href="/" className="hover:text-[#39834B] transition">
                  About CraveRoute
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#39834B] transition">
                  Our Culinary Story
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#39834B] transition flex items-center gap-1.5">
                  <span>Careers</span>
                  <span className="px-1.5 py-0.2 bg-[#EBF7EE] text-[#39834B] font-bold text-[10px] rounded-full">
                    Hiring
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#39834B] transition">
                  Partner Restaurants
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#39834B] transition">
                  Eco-Friendly Packaging
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#39834B] transition">
                  Press & Media Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Perks */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#19231D]">
                Customer Support
              </h4>
              <ul className="space-y-2 text-xs text-[#70786F]">
                <li>
                  <Link href="/orders" className="hover:text-[#39834B] transition flex items-center gap-1.5">
                    <span>Track Live Order</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39834B] animate-pulse" />
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-[#39834B] transition">
                    Help Center & FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-[#39834B] transition">
                    Hygiene & Safe Packaging Standards
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-[#39834B] transition">
                    Refund & Cancellation Policies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="p-4 bg-[#FAF9F5] border border-[#E8E9E2] rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#183D2B]">
                <Sparkles className="w-3.5 h-3.5 text-[#39834B]" />
                <span>Get ₹150 OFF your first order</span>
              </div>
              <p className="text-[11px] text-[#70786F]">
                Subscribe for weekly chef drops, exclusive secret menus, and seasonal discounts.
              </p>

              {isSubscribed ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#39834B] py-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#39834B]" />
                  <span>Welcome to the club! Coupon sent to your email.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#E8E9E2] rounded-xl text-xs text-[#19231D] placeholder-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods & Trust Badges Strip */}
        <div className="mt-10 pt-6 border-t border-[#F0F2EB] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#70786F]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-[#19231D]">Accepted Payments:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF9F5] border border-[#E8E9E2] rounded-lg font-medium text-[11px] text-[#19231D]">
              <QrCode className="w-3 h-3 text-[#39834B]" />
              <span>Instant UPI (GPay / PhonePe / Paytm)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF9F5] border border-[#E8E9E2] rounded-lg font-medium text-[11px] text-[#19231D]">
              <Banknote className="w-3 h-3 text-[#39834B]" />
              <span>Cash on Delivery</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF9F5] border border-[#E8E9E2] rounded-lg font-medium text-[11px] text-[#19231D]">
              <CreditCard className="w-3 h-3 text-[#39834B]" />
              <span>Cards (Visa, Mastercard, RuPay)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#39834B] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#39834B]" />
            <span>FSSAI Certified Kitchens • 100% Quality Guaranteed</span>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="mt-6 pt-5 border-t border-[#E8E9E2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#70786F] gap-3">
          <p>&copy; {new Date().getFullYear()} CraveRoute Technologies Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-[#19231D] transition">
              Privacy Policy
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/" className="hover:text-[#19231D] transition">
              Terms of Service
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/" className="hover:text-[#19231D] transition">
              Cookie Preferences
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/" className="hover:text-[#19231D] transition">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
