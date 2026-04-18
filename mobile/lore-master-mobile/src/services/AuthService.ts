import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { AuthUser, LoginCredentials, SignupData } from '../types';

class AuthService {
  private static instance: AuthService;
  private authStateListeners: Array<(user: AuthUser | null) => void> = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign up new user
   */
  async signup(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Sign in existing user
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      console.log('[AuthService] Signing out user');
      await signOut(auth);
      console.log('[AuthService] User signed out successfully');
    } catch (error: any) {
      console.error('[AuthService] Logout error:', error);
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.formatUser(user) : null;
  }

  /**
   * Get ID token for API calls
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      const token = await user.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error('[AuthService] Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      const authUser = firebaseUser ? this.formatUser(firebaseUser) : null;
      callback(authUser);
    });
  }

  /**
   * Wait for auth initialization
   */
  async waitForAuthInit(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user ? this.formatUser(user) : null);
      });
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Format Firebase user to AuthUser
   */
  private formatUser(firebaseUser: User): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      emailVerified: firebaseUser.emailVerified,
      accessToken: '', // Will be set separately
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  }

  /**
   * Format Firebase error to user-friendly message
   */
  private formatError(error: any): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    };

    const code = error?.code || 'unknown';
    const message = errorMessages[code] || error?.message || 'An unexpected error occurred. Please try again.';

    return message;
  }
}

export default AuthService.getInstance();
