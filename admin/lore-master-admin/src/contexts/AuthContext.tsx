'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminRole, AdminUser } from '@/utils/adminVerification';
import { setGoogleIdToken, getGoogleIdToken } from '@/lib/authToken';
import toast from 'react-hot-toast';

export interface SessionUser {
  email?: string;
  name?: string;
  picture?: string;
  uid?: string;
}

interface AuthContextType {
  user: SessionUser | null;
  adminUser: AdminUser | null;
  /** @deprecated Use signInWithGoogleCredential */
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const applyCredential = useCallback(async (credential: string) => {
    setGoogleIdToken(credential);
    const payload = decodeJwtPayload(credential);
    const session: SessionUser = {
      email: typeof payload?.email === 'string' ? payload.email : undefined,
      name: typeof payload?.name === 'string' ? payload.name : undefined,
      picture: typeof payload?.picture === 'string' ? payload.picture : undefined,
      uid: typeof payload?.sub === 'string' ? payload.sub : undefined,
    };
    setUser(session);

    const adminUserData = await verifyAdminRole();
    if (adminUserData) {
      setAdminUser(adminUserData);
      return true;
    }

    setAdminUser(null);
    return false;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getGoogleIdToken();
      if (!token) {
        setUser(null);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      try {
        const ok = await applyCredential(token);
        if (cancelled) {
          return;
        }
        if (!ok) {
          setGoogleIdToken(null);
          setUser(null);
          setAdminUser(null);
        }
      } catch {
        if (!cancelled) {
          setGoogleIdToken(null);
          setUser(null);
          setAdminUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [applyCredential]);

  const signInWithGoogleCredential = async (credential: string) => {
    setLoading(true);
    try {
      const ok = await applyCredential(credential);
      if (ok) {
        toast.success('Signed in as admin');
        router.replace('/dashboard');
      } else {
        setGoogleIdToken(null);
        setUser(null);
        setAdminUser(null);
        toast.error('Access denied. Admin privileges required.');
        throw new Error('Admin privileges required');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (_email: string, _password: string) => {
    throw new Error('Email/password login is disabled. Use Google Sign-In.');
  };

  const logout = () => {
    setGoogleIdToken(null);
    setUser(null);
    setAdminUser(null);
    toast.success('Signed out');
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    adminUser,
    login,
    signInWithGoogleCredential,
    logout,
    loading,
    isAdmin: adminUser !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
