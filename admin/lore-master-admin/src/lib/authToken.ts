const STORAGE_KEY = 'lm_google_id_token';

let memoryToken: string | null = null;

export function setGoogleIdToken(token: string | null): void {
  memoryToken = token;
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getGoogleIdToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}
