/**
 * Authentication Service
 * 
 * Handles user authentication with Google Sign-In via Firebase.
 * Singleton pattern ensures single instance across the app.
 */

import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';

export class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;
    private authStateListeners: Array<(user: User | null) => void> = [];

    private constructor() {
        // Listen for auth state changes if auth is initialized
        if (auth) {
            onAuthStateChanged(auth, (user) => {
                this.currentUser = user;

                // Notify all listeners
                this.authStateListeners.forEach(listener => listener(user));
            });
        }
    }

    /**
     * Get singleton instance
     */
    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Sign in with Google account
     */
    async signInWithGoogle(): Promise<User> {
        if (!auth) throw new Error('Firebase Auth not initialized. Check your .env setup.');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            this.currentUser = result.user;
            return result.user;
        } catch (error: any) {
            console.error('Google sign-in failed:', error);
            throw new Error(error.message || 'Failed to sign in with Google');
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        if (!auth) return; // No-op if not initialized

        try {
            await firebaseSignOut(auth);
            this.currentUser = null;
        } catch (error: any) {
            console.error('Sign out failed:', error);
            throw new Error('Failed to sign out');
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    /**
     * Subscribe to auth state changes
     * @returns Unsubscribe function
     */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        this.authStateListeners.push(callback);

        // Immediately call with current state
        callback(this.currentUser);

        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    /**
     * Get user's display name
     */
    getUserDisplayName(): string | null {
        return this.currentUser?.displayName || null;
    }

    /**
     * Get user's email
     */
    getUserEmail(): string | null {
        return this.currentUser?.email || null;
    }

    /**
     * Get user's photo URL
     */
    getUserPhotoURL(): string | null {
        return this.currentUser?.photoURL || null;
    }
}
