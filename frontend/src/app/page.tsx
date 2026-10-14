'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Clock, Compass, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';
import { MenuCard } from '@/components/MenuCard';
import { MenuItem } from '@/types';
import { fetchMenu } from '@/services/api';

export default function HomePage() {
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenu()
      .then((items) => {
        setFeaturedItems(items.slice(0, 4));
      })
      .catch(() => {
        // Fallback gracefully if API is booting
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/menu');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Screen A: Editorial Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & Address Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF7EE] border border-[#D1EED7] text-xs font-bold text-[#39834B]">
              <span>Fresh • Fast • Delicious</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#19231D] leading-[1.08]">
              Good Food <br />
              Delivered Right
            </h1>

            <p className="text-base sm:text-lg text-[#70786F] max-w-xl leading-relaxed">
              Discover the best food from your favorite restaurants, crafted with
              fresh ingredients and delivered right to your doorstep.
            </p>

            {/* Address Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 bg-white rounded-2xl border border-[#E8E9E2] shadow-sm max-w-xl"
            >
              <div className="flex items-center gap-2.5 px-3 py-1.5 flex-1">
                <Search className="w-5 h-5 text-[#70786F] shrink-0" />
                <input
                  type="text"
                  placeholder="Enter delivery address..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#19231D] placeholder-[#70786F] bg-transparent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-[#39834B] hover:bg-[#183D2B] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Trust Indicators matching Screen A */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8E9E2]">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] flex items-center justify-center text-[#39834B] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#19231D]">Fresh Ingredients</h4>
                  <p className="text-[11px] text-[#70786F]">Always</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] flex items-center justify-center text-[#39834B] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#19231D]">Fast Delivery</h4>
                  <p className="text-[11px] text-[#70786F]">On Time</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] flex items-center justify-center text-[#39834B] shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#19231D]">Track Your Order</h4>
                  <p className="text-[11px] text-[#70786F]">Live Updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Food Photography */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square">
              {/* Floating Badge */}
              <div className="absolute top-4 right-2 z-20 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-[#E8E9E2] text-center rotate-3">
                <span className="block text-[10px] font-bold tracking-wider text-[#39834B] uppercase">
                  Chef Highlight
                </span>
                <span className="text-xs font-extrabold text-[#19231D]">
                  Best Burgers in Town!
                </span>
              </div>

              {/* Burger Hero Image */}
              <div 
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#F0EFE9]"
                style={{ position: 'relative' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
                  alt="Juicy double smash cheeseburger with fresh lettuce and tomato"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Shortcut */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#19231D]">Explore Categories</h2>
            <p className="text-xs text-[#70786F]">Order by dish type</p>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#39834B] hover:text-[#183D2B] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {[
            { name: 'Burgers', icon: '🍔', desc: 'Smashed & Prime' },
            { name: 'Pizzas', icon: '🍕', desc: 'Sourdough Crust' },
            { name: 'Pasta', icon: '🍝', desc: 'Handcrafted Ribbon' },
            { name: 'Salads', icon: '🥗', desc: 'Crisp & Farm-Fresh' },
            { name: 'Desserts', icon: '🍨', desc: 'Sweet Indulgence' },
            { name: 'Drinks', icon: '🥤', desc: 'Cold & Refreshing' },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${cat.name}`}
              className="p-4 bg-white rounded-2xl border border-[#E8E9E2] text-center hover:border-[#39834B] hover:shadow-md transition-all group"
            >
              <span className="text-3xl block mb-1 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-bold text-[#19231D] block">{cat.name}</span>
              <span className="text-[10px] text-[#70786F] block">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Menu Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#19231D]">Popular Right Now</h2>
            <p className="text-xs text-[#70786F]">Most ordered by our food lovers</p>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#39834B] hover:text-[#183D2B] flex items-center gap-1"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-[#E8E9E2]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Secondary Story Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#183D2B] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full bg-[#C8F169] text-[#183D2B] text-[11px] font-bold uppercase tracking-wider">
              Real-Time Kitchen Journey
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Watch your food being prepared in real time.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Every order connects directly to our kitchen lifecycle engine. Watch the live
              progression from ticket acceptance to delivery with live updates.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8F169] hover:bg-[#b5e054] text-[#183D2B] text-xs font-bold rounded-xl transition shadow-sm"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div 
            className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0"
            style={{ position: 'relative' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
              alt="Freshly baked artisan pizza"
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
