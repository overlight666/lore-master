'use client';

import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signInWithGoogleCredential } = useAuth();

  const handleGoogleSuccess = async (credential: string | undefined) => {
    if (!credential) {
      toast.error('No credential returned from Google');
      return;
    }
    try {
      await signInWithGoogleCredential(credential);
    } catch {
      /* toast in context */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lore Master Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account (admin access required)
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <p className="text-sm text-red-600 text-center">
              Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.
            </p>
          ) : (
            <GoogleLogin
              onSuccess={(cred) => void handleGoogleSuccess(cred.credential)}
              onError={() => toast.error('Google Sign-In failed')}
              useOneTap={false}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Administrator access is granted in the database. Contact your super admin if you need access.
        </p>
      </div>
    </div>
  );
}
