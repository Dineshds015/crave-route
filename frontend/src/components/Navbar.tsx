'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { totalItemCount } = useCart();
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    ...(isAuthenticated ? [{ label: 'Orders', href: '/orders' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E8E9E2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#183D2B] flex items-center justify-center text-[#C8F169] transition-transform group-hover:scale-105 shadow-xs">
            <Leaf className="w-5 h-5 fill-[#C8F169]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#19231D]">
            Crave<span className="text-[#39834B]">Route</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-6 sm:gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  isActive
                    ? 'text-[#39834B]'
                    : 'text-[#70786F] hover:text-[#19231D]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#39834B] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon with badge */}
          <Link
            href="/cart"
            id="nav-cart-button"
            className="relative p-2 rounded-xl text-[#19231D] hover:bg-[#E8E9E2]/60 transition"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] font-bold bg-[#39834B] text-white rounded-full flex items-center justify-center shadow-xs">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* User Profile / Mobile Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39834B]/10 border border-[#39834B]/20 text-[#183D2B] text-xs font-bold hover:bg-[#39834B]/20 transition"
                title={`Logged in as ${user.phone}`}
              >
                <UserIcon className="w-3.5 h-3.5 text-[#39834B]" />
                <span className="max-w-[110px] truncate">{user.name || user.phone}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-[#70786F] hover:text-[#C43D36] hover:bg-red-50 text-xs font-semibold transition"
                title="Sign Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#183D2B] text-[#C8F169] hover:bg-[#23533b] text-xs font-bold transition shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
