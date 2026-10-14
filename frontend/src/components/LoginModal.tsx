'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDemoUsers } from '@/services/api';
import { X, Smartphone, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp } = useAuth();
  
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<{ phone: string; name: string; defaultOtp: string }[]>([
    { phone: '+91 98765 43210', name: 'Dinesh Kumar', defaultOtp: '123456' },
    { phone: '+91 11111 11111', name: 'Alex Chen', defaultOtp: '123456' },
    { phone: '+91 99999 88888', name: 'Sarah Jenkins', defaultOtp: '123456' },
    { phone: '+1 234 567 8900', name: 'Marcus Vance', defaultOtp: '123456' },
  ]);

  useEffect(() => {
    if (isLoginModalOpen) {
      setStep('PHONE');
      setError(null);
      setServerMsg(null);
      fetchDemoUsers()
        .then((users) => {
          if (users && users.length > 0) setDemoUsers(users);
        })
        .catch(() => {});
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendOtp(phone.trim());
      setServerMsg(res.message);
      setOtp(res.otp || '123456');
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyOtp(phone.trim(), otp.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (demoPhone: string) => {
    setPhone(demoPhone);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E9E2] overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-[#183D2B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C8F169]/20 border border-[#C8F169]/30 flex items-center justify-center text-[#C8F169]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">CraveRoute Sign In</h3>
              <p className="text-[11px] text-stone-300">Sync your orders across all devices</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-[#C43D36] text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#70786F]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl text-sm font-medium text-[#19231D] placeholder:text-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* Seeded Demo Numbers in DB */}
              <div className="space-y-2 pt-1">
                <span className="block text-[11px] font-bold text-[#70786F] uppercase tracking-wider">
                  Or select a seeded account (OTP: 123456):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((u) => (
                    <button
                      type="button"
                      key={u.phone}
                      onClick={() => selectDemoUser(u.phone)}
                      className={`p-2 rounded-xl text-left border transition text-xs flex flex-col ${
                        phone.replace(/\s+/g, '') === u.phone.replace(/\s+/g, '')
                          ? 'border-[#39834B] bg-[#39834B]/10 font-bold text-[#183D2B]'
                          : 'border-[#E8E9E2] hover:bg-[#FAF9F5] text-[#19231D]'
                      }`}
                    >
                      <span className="font-bold truncate">{u.name}</span>
                      <span className="text-[10px] text-[#70786F] font-mono">{u.phone}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#39834B] hover:bg-[#2d6b3c] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-[#FAF9F5] border border-[#E8E9E2] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-[#70786F] uppercase">
                    Code sent to
                  </span>
                  <span className="text-xs font-bold text-[#19231D] font-mono">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-xs font-bold text-[#39834B] hover:underline"
                >
                  Change
                </button>
              </div>

              {serverMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{serverMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#19231D] mb-1.5">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#70786F]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-[#E8E9E2] rounded-xl text-base font-mono tracking-widest text-center text-[#19231D] placeholder:text-[#A0A59E] focus:outline-none focus:ring-2 focus:ring-[#39834B] transition"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-[#70786F] mt-1.5 text-center">
                  Stored in database • Default OTP is <strong className="text-[#19231D]">123456</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#39834B] hover:bg-[#2d6b3c] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Access Orders'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[#F0F2EB] flex items-center justify-center gap-1.5 text-[11px] text-[#70786F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39834B]" />
            <span>Secure mobile authentication stored in MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
