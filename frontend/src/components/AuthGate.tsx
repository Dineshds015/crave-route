'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Smartphone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthGateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  children: React.ReactNode;
}

export function AuthGate({
  title = 'Sign In Required',
  description = 'Please sign in with your mobile phone number to access this feature.',
  actionLabel = 'Sign In with Mobile OTP',
  children,
}: AuthGateProps) {
  const { isAuthenticated, user, openLoginModal } = useAuth();

  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in duration-300">
      <div className="w-18 h-18 rounded-3xl bg-[#183D2B] border border-[#39834B]/30 flex items-center justify-center mx-auto text-[#C8F169] shadow-lg">
        <Smartphone className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19231D] tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#70786F] leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-[#E8E9E2] shadow-2xs space-y-3 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#39834B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#19231D]">
            <p className="font-bold">Fast & Passwordless Access</p>
            <p className="text-[#70786F] text-[11px] mt-0.5">
              Instant login via 6-digit OTP. Your orders and delivery addresses stay synchronized across all devices.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={openLoginModal}
          className="w-full py-3.5 px-6 bg-[#39834B] hover:bg-[#2e6d3e] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70786F] hover:text-[#19231D] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
