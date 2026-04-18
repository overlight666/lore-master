import { getGoogleIdToken } from '@/lib/authToken';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'super_admin';
}

const apiBase = () =>
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL || '';

export async function verifyAdminRole(): Promise<AdminUser | null> {
  try {
    const token = getGoogleIdToken();
    if (!token) {
      return null;
    }

    const base = apiBase();
    if (!base) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      return null;
    }

    const res = await fetch(`${base.replace(/\/$/, '')}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const u = data.user;
    if (u?.role === 'admin' || u?.role === 'super_admin') {
      return {
        uid: u.uid ?? u.id,
        email: u.email || '',
        role: u.role,
      };
    }

    return null;
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return null;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  const adminUser = await verifyAdminRole();
  return adminUser !== null;
}
