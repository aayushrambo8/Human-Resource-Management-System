'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AuthContext, useAuth } from '@/lib/auth-context';
import {
  clearTokens,
  getSessionEmail,
  hasSession,
  saveSessionEmail,
  saveTokens,
} from '@/lib/api-client';
import type { TokenResponse } from '@/lib/types';

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(hasSession());
    setEmail(getSessionEmail());
    setHydrated(true);
  }, []);

  const acceptSession = useCallback((tokens: TokenResponse) => {
    saveTokens(tokens);
    saveSessionEmail(tokens.email);
    setEmail(tokens.email);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await authApi.login(username, password);
      acceptSession(tokens);
    },
    [acceptSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('hrms.refreshToken') : null;
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearTokens();
      if (typeof window !== 'undefined') sessionStorage.removeItem('hrms.email');
      setIsAuthenticated(false);
      setEmail('');
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    const handleExpired = () => {
      clearTokens();
      if (typeof window !== 'undefined') sessionStorage.removeItem('hrms.email');
      setIsAuthenticated(false);
      setEmail('');
      router.push('/login?expired=true');
      router.refresh();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('hrms:session-expired', handleExpired);
      return () => window.removeEventListener('hrms:session-expired', handleExpired);
    }
  }, [router]);

  const value = useMemo(() => ({ email, isAuthenticated, login, logout }), [email, isAuthenticated, login, logout]);

  if (!hydrated) return <div style={{ minHeight: '100vh' }} />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);
}