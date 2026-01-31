/**
 * useAuth Hook
 * 
 * React hook for accessing authentication state and methods.
 */

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { AuthService } from '../services/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const authService = AuthService.getInstance();

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = authService.onAuthStateChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, [authService]);

    const signIn = async () => {
        return await authService.signInWithGoogle();
    };

    const signOut = async () => {
        await authService.signOut();
    };

    return {
        user,
        loading,
        isAuthenticated: authService.isAuthenticated(),
        signIn,
        signOut,
        displayName: authService.getUserDisplayName(),
        email: authService.getUserEmail(),
        photoURL: authService.getUserPhotoURL()
    };
}
