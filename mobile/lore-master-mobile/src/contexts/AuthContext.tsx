import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'lore_master_auth_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase Auth state changes on mount
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener...');
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        console.log('[AuthContext] Getting ID token...');
        // Get the ID token for API authentication
        const accessToken = await AuthService.getIdToken();
        console.log('[AuthContext] ID token received:', accessToken ? 'Token available' : 'No token');
        const userData: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.name || 'User',
          emailVerified: firebaseUser.emailVerified,
          accessToken: accessToken || '',
          createdAt: new Date().toISOString(),
        };
        console.log('[AuthContext] Setting user data:', userData);
        setUser(userData);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        console.log('[AuthContext] Clearing user data');
        setUser(null);
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update API service auth token when user changes
  useEffect(() => {
    const initializeBackendUser = async () => {
      console.log('[AuthContext] User state changed:', user ? 'User exists' : 'No user');
      if (user?.accessToken) {
        console.log('[AuthContext] Setting API token:', user.accessToken.substring(0, 20) + '...');
        ApiService.setAuthToken(user.accessToken);
        
        // Initialize user in backend database
        try {
          console.log('[AuthContext] Initializing user in backend...');
          await ApiService.initializeUser();
          console.log('[AuthContext] User successfully initialized in backend');
          
          // Small delay to ensure user is fully created before other API calls
          setTimeout(() => {
            console.log('[AuthContext] User ready for API calls');
          }, 1000);
        } catch (error) {
          console.error('[AuthContext] Failed to initialize user in backend:', error);
          // Don't throw error - user can still use the app even if backend user creation fails
        }
      } else {
        console.log('[AuthContext] Clearing API token');
        ApiService.setAuthToken(null);
      }
    };

    initializeBackendUser();
  }, [user]);

  const saveUserToStorage = async (userData: AuthUser) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const clearUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error clearing user from storage:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      const authUser = await AuthService.signup(email, password, name);
      
      // Get the ID token for API authentication
      const accessToken = await AuthService.getIdToken();
      if (!accessToken) {
        throw new Error('Failed to get access token after signup');
      }

      const userData: AuthUser = {
        uid: authUser.uid,
        email: authUser.email || email,
        name: authUser.displayName || name,
        emailVerified: authUser.emailVerified,
        accessToken,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      await saveUserToStorage(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const authUser = await AuthService.login(email, password);
      
      // Get the ID token for API authentication
      const accessToken = await AuthService.getIdToken();
      if (!accessToken) {
        throw new Error('Failed to get access token after login');
      }

      const userData: AuthUser = {
        uid: authUser.uid,
        email: authUser.email || email,
        name: authUser.displayName || 'User',
        emailVerified: authUser.emailVerified,
        accessToken,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      await saveUserToStorage(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.logout();
      await clearUserFromStorage();
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if logout fails, clear local state
      await clearUserFromStorage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
