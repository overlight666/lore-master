'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (
      !loading &&
      (!user || !isAdmin) &&
      pathname &&
      !pathname.includes('/login') &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      router.replace('/login');
    }
  }, [user, isAdmin, loading, router, pathname]);

  useEffect(() => {
    if (user && isAdmin) {
      hasRedirected.current = false;
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!user ? 'Redirecting to login...' : 'Verifying admin access...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
