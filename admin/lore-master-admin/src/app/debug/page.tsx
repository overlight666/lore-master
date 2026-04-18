'use client';

import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthDebug() {
  const { user, loading, logout, signInWithGoogleCredential } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Auth Debug</h1>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Current state</h2>
        <p>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Email:</strong> {user?.email ?? 'None'}
        </p>
        <p>
          <strong>UID:</strong> {user?.uid ?? 'None'}
        </p>
      </div>

      {!user ? (
        <div className="bg-blue-50 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-4">Google Sign-In</h2>
          <GoogleLogin
            onSuccess={(cred) => cred.credential && signInWithGoogleCredential(cred.credential)}
            onError={() => console.error('Google error')}
          />
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded mb-6">
          <p className="mb-2">Signed in as {user.email}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
