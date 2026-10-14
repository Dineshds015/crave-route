'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Flame, Clock, Sparkles } from 'lucide-react';

export function HeroBanner({ onExploreMenu }: { onExploreMenu?: () => void }) {
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE6] border border-[#E5DFD3] text-xs font-semibold text-[#78716C]">
            <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Artisanal culinary kitchen</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-[#1C1917] font-editorial leading-[1.1]">
            Hot, crispy <br />
            <span className="italic text-[#C2410C] font-serif">meals</span> <br />
            at your door.
          </h1>

          <p className="text-base sm:text-lg text-[#57534E] max-w-xl leading-relaxed">
            Crafted each morning, made fresh on order, and delivered piping hot
            to your home with real-time Kitchen Journey tracking.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExploreMenu}
              className="px-6 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#C2410C]/20 transition-all hover:scale-[1.02]"
            >
              Order now →
            </button>
            <button
              onClick={onExploreMenu}
              className="px-6 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#1C1917] text-sm font-semibold rounded-xl border border-[#D6CFC4] transition"
            >
              View menu
            </button>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E7E2D7]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                <Flame className="w-4 h-4 text-[#C2410C]" />
                <span>Made fresh</span>
              </div>
              <p className="text-[12px] text-[#78716C]">Never reheated</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                <Clock className="w-4 h-4 text-[#C2410C]" />
                <span>30–45 min</span>
              </div>
              <p className="text-[12px] text-[#78716C]">To your door</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                <Sparkles className="w-4 h-4 text-[#4D7C0F]" />
                <span>Zero wait</span>
              </div>
              <p className="text-[12px] text-[#78716C]">Live kitchen journey</p>
            </div>
          </div>
        </div>

        {/* Right Column / Visual Showcase Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* Top Rating Badge */}
            <div className="absolute -top-4 -right-2 sm:right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-[#E7E2D7] text-left">
              <div className="text-[10px] font-bold tracking-wider text-[#78716C] uppercase">
                Customer Rating
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1C1917]">4.9</span>
              </div>
              <div className="text-[10px] text-[#78716C]">from 350+ orders</div>
            </div>

            {/* Food Image Card */}
            <div className="relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#EFECE6]">
              <Image
                src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80"
                alt="Golden crispy artisanal samosas with fresh mint and chutney"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Bottom Tag */}
              <div className="absolute bottom-4 left-4 z-10 bg-[#C2410C] text-white px-4 py-2 rounded-xl shadow-md">
                <span className="block text-[10px] uppercase font-semibold text-amber-200">
                  Today
                </span>
                <span className="text-sm font-bold">Open now</span>
                <span className="text-[11px] text-amber-100 block">until 22:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
