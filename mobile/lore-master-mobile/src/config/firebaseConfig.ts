import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamically import getReactNativePersistence for compatibility
let getReactNativePersistence;
try {
  getReactNativePersistence = require('firebase/auth/react-native').getReactNativePersistence;
} catch (e) {
  getReactNativePersistence = require('firebase/auth').getReactNativePersistence;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzlaLTLVi-VHY9KGHEYL8WDhMCtPxr4Yk",
  authDomain: "loremaster-287f0.firebaseapp.com",
  projectId: "loremaster-287f0",
  storageBucket: "loremaster-287f0.firebasestorage.app",
  messagingSenderId: "182581270025",
  appId: "1:182581270025:web:ab5e628422a234bc6c8ad8",
  measurementId: "G-M4V2M3W36D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
