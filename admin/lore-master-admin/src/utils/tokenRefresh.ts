import { getGoogleIdToken } from '@/lib/authToken';

/**
 * Google ID tokens expire (~1h). Re-run Google Sign-In to obtain a new credential, or use OAuth refresh flows.
 */
export async function forceTokenRefresh(): Promise<string | null> {
  return getGoogleIdToken();
}

export function decodeTokenForDebugging(token: string) {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload (debug):', {
      iss: payload.iss,
      aud: payload.aud,
      email: payload.email,
      exp: new Date(payload.exp * 1000).toISOString(),
    });

    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
