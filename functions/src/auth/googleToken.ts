import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client();

export type GoogleUserPayload = {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
};

/**
 * Verifies a Google Sign-In ID token (JWT from GIS / OAuth).
 * Set GOOGLE_CLIENT_ID to your Web client ID (comma-separated for multiple clients).
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserPayload> {
  const raw = process.env.GOOGLE_CLIENT_ID;
  if (!raw?.trim()) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }
  const audiences = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const ticket = await oauth2Client.verifyIdToken({
    idToken,
    audience: audiences.length === 1 ? audiences[0] : audiences,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error('Invalid Google token payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
  };
}

export function parseEmailAllowlist(envVar: string | undefined): Set<string> {
  const set = new Set<string>();
  if (!envVar?.trim()) {
    return set;
  }
  for (const part of envVar.split(',')) {
    const e = part.trim().toLowerCase();
    if (e) {
      set.add(e);
    }
  }
  return set;
}
