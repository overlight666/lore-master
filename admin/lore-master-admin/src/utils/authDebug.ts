import { getGoogleIdToken } from '@/lib/authToken';
import { decodeTokenForDebugging } from '@/utils/tokenRefresh';

export async function debugAuthState() {
  console.log('=== DEBUG AUTH (Google) ===');

  try {
    const token = getGoogleIdToken();
    if (!token) {
      return {
        authenticated: false,
        error: 'No Google ID token in storage',
      };
    }

    decodeTokenForDebugging(token);
    return {
      authenticated: true,
      tokenLength: token.length,
    };
  } catch (error) {
    console.error('Debug auth state error:', error);
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testApiCall(endpoint: string = '/admin/dashboard/stats') {
  const token = getGoogleIdToken();
  if (!token) {
    throw new Error('No Google ID token');
  }

  const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL || '';
  const apiUrl = `${base.replace(/\/$/, '')}${endpoint}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json();
}
