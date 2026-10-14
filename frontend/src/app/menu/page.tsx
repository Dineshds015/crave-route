'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, UtensilsCrossed } from 'lucide-react';
import { MenuCard } from '@/components/MenuCard';
import { MenuItem } from '@/types';
import { fetchMenu } from '@/services/api';

function MenuDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu()
      .then((items) => {
        setMenuItems(items);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load menu items.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(menuItems.map((m) => m.category)));
    return ['All', ...list];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = vegetarianOnly
        ? item.dietary.some((d) => d.toLowerCase().includes('veg'))
        : true;
      return matchesCat && matchesSearch && matchesDietary;
    });
  }, [menuItems, selectedCategory, searchQuery, vegetarianOnly]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
      {/* Header matching Screen B */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#19231D] tracking-tight">
            Our Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#70786F] mt-1">
            Explore our delicious collection of fresh and tasty meals.
          </p>
        </div>

        {/* Search & Filter Bar matching Screen B */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#70786F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#E8E9E2] rounded-xl text-xs text-[#19231D] placeholder-[#70786F] focus:outline-none focus:ring-2 focus:ring-[#39834B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70786F] hover:text-[#19231D]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setVegetarianOnly(!vegetarianOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              vegetarianOnly
                ? 'bg-[#EBF7EE] border-[#39834B] text-[#39834B]'
                : 'bg-white border-[#E8E9E2] text-[#70786F] hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vegetarian</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Pills matching Screen B */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#39834B] text-white shadow-xs'
                  : 'bg-white text-[#70786F] hover:bg-[#FAF9F5] border border-[#E8E9E2]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-72 bg-white rounded-2xl animate-pulse border border-[#E8E9E2]"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E9E2] space-y-3">
          <p className="text-sm font-bold text-[#C43D36]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#39834B] text-white text-xs font-semibold rounded-xl"
          >
            Retry Loading Menu
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#E8E9E2] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] flex items-center justify-center mx-auto text-[#70786F]">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#19231D]">No dishes found</h3>
          <p className="text-xs text-[#70786F] max-w-sm mx-auto">
            We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo;. Try another term or reset your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setVegetarianOnly(false);
            }}
            className="px-4 py-2 bg-[#183D2B] text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Product Grid matching Screen B */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
          <div className="h-10 w-48 bg-white rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <MenuDiscoveryContent />
    </Suspense>
  );
}
