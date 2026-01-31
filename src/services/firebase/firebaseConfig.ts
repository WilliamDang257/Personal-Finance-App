/**
 * Firebase Configuration
 * 
 * Initializes Firebase app, authentication, and Firestore database.
 * Environment variables are loaded from .env.local file.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const hasApiKey = !!firebaseConfig.apiKey;

export const app = hasApiKey ? initializeApp(firebaseConfig) : (null as unknown as ReturnType<typeof initializeApp>);
export const auth = hasApiKey && app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
export const db = hasApiKey && app ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence (allows offline access)
if (hasApiKey && db) {
    try {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Offline persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Offline persistence not supported by this browser');
            }
        });
    } catch (error) {
        console.error('Failed to enable offline persistence:', error);
    }
}
