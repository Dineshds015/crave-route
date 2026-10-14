'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (phone: string) => Promise<{ phone: string; otp: string; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('craveroute_auth_user');
      const savedToken = localStorage.getItem('craveroute_auth_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true);
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const sendOtp = useCallback(async (phone: string) => {
    return await apiSendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const res = await apiVerifyOtp(phone, otp);
    setUser(res.user);
    setToken(res.token);
    try {
      localStorage.setItem('craveroute_auth_user', JSON.stringify(res.user));
      localStorage.setItem('craveroute_auth_token', res.token);
    } catch {}
    setIsLoginModalOpen(false);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('craveroute_auth_user');
      localStorage.removeItem('craveroute_auth_token');
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
