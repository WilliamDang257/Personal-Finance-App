/**
 * Firebase Storage Adapter
 * 
 * Stores all data in Firebase Firestore with real-time sync.
 * Features:
 * - Real-time updates across devices
 * - Offline support (IndexedDB cache)
 * - User-scoped data security
 * - Automatic conflict resolution
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
    type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import type { StorageAdapter } from './StorageAdapter';
import type { Transaction, Asset, Budget, AppSettings } from '../../types';

export class FirebaseAdapter implements StorageAdapter {
    private userId: string | null = null;
    private unsubscribers: Unsubscribe[] = [];
    private deviceId: string;
    private ready = false;

    constructor() {
        this.deviceId = this.getOrCreateDeviceId();
    }

    // ===== Lifecycle =====

    async initialize(): Promise<void> {
        // Check if Firebase is initialized
        if (!auth || !db) {
            throw new Error('Firebase configuration missing. Check your .env setup.');
        }

        // Wait for auth
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be authenticated to use Firebase storage');
        }

        this.userId = user.uid;
        this.ready = true;
    }

    isReady(): boolean {
        return this.ready && !!this.userId && !!auth.currentUser;
    }

    async disconnect(): Promise<void> {
        // Unsubscribe from all listeners
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.ready = false;
        this.userId = null;
    }

    // ===== Transactions =====

    async getTransactions(): Promise<Transaction[]> {
        this.ensureReady();

        const snapshot = await getDocs(
            collection(db, `users/${this.userId}/transactions`)
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Transaction));
    }

    async getTransaction(id: string): Promise<Transaction | null> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/transactions/${id}`);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...snapshot.data()
        } as Transaction;
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/transactions/${transaction.id}`);

        await setDoc(docRef, {
            ...transaction,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async updateTransaction(transaction: Transaction): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/transactions/${transaction.id}`);

        await updateDoc(docRef, {
            ...transaction,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async deleteTransaction(id: string): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/transactions/${id}`);
        await deleteDoc(docRef);
    }

    // ===== Assets =====

    async getAssets(): Promise<Asset[]> {
        this.ensureReady();

        const snapshot = await getDocs(
            collection(db, `users/${this.userId}/assets`)
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Asset));
    }

    async getAsset(id: string): Promise<Asset | null> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/assets/${id}`);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...snapshot.data()
        } as Asset;
    }

    async saveAsset(asset: Asset): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/assets/${asset.id}`);

        await setDoc(docRef, {
            ...asset,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async updateAsset(asset: Asset): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/assets/${asset.id}`);

        await updateDoc(docRef, {
            ...asset,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async deleteAsset(id: string): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/assets/${id}`);
        await deleteDoc(docRef);
    }

    // ===== Budgets =====

    async getBudgets(): Promise<Budget[]> {
        this.ensureReady();

        const snapshot = await getDocs(
            collection(db, `users/${this.userId}/budgets`)
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Budget));
    }

    async getBudget(id: string): Promise<Budget | null> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/budgets/${id}`);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...snapshot.data()
        } as Budget;
    }

    async saveBudget(budget: Budget): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/budgets/${budget.id}`);

        await setDoc(docRef, {
            ...budget,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async updateBudget(budget: Budget): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/budgets/${budget.id}`);

        await updateDoc(docRef, {
            ...budget,
            updatedAt: serverTimestamp(),
            deviceId: this.deviceId
        });
    }

    async deleteBudget(id: string): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/budgets/${id}`);
        await deleteDoc(docRef);
    }

    // ===== Settings =====

    async getSettings(): Promise<AppSettings | null> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/settings/main`);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return snapshot.data() as AppSettings;
    }

    async saveSettings(settings: AppSettings): Promise<void> {
        this.ensureReady();

        const docRef = doc(db, `users/${this.userId}/settings/main`);

        await setDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp()
        });
    }

    // ===== Sync Management =====

    async getLastSyncTime(): Promise<Date | null> {
        this.ensureReady();

        try {
            // Get the latest updatedAt timestamp from any document
            const [transactions, assets, budgets] = await Promise.all([
                this.getTransactions(),
                this.getAssets(),
                this.getBudgets()
            ]);

            const allDocs = [...transactions, ...assets, ...budgets];

            if (allDocs.length === 0) return null;

            // Find the most recent timestamp
            let latest = new Date(0);

            for (const doc of allDocs) {
                const timestamp = (doc as any).updatedAt;
                if (!timestamp) continue;

                // Handle Firestore Timestamp
                const date = timestamp instanceof Object && 'toDate' in timestamp
                    ? (timestamp as Timestamp).toDate()
                    : new Date(timestamp);

                if (date > latest) {
                    latest = date;
                }
            }

            return latest.getTime() > 0 ? latest : null;
        } catch (error) {
            console.error('Failed to get last sync time:', error);
            return null;
        }
    }

    async syncNow(): Promise<void> {
        // Firebase auto-syncs, this is a no-op
        // Could implement manual refresh if needed
    }

    onDataChanged(callback: () => void): () => void {
        this.ensureReady();

        const userId = this.userId!;

        // Listen to all collections
        const unsubTransactions = onSnapshot(
            collection(db, `users/${userId}/transactions`),
            () => callback(),
            (error) => console.error('Transaction listener error:', error)
        );

        const unsubAssets = onSnapshot(
            collection(db, `users/${userId}/assets`),
            () => callback(),
            (error) => console.error('Asset listener error:', error)
        );

        const unsubBudgets = onSnapshot(
            collection(db, `users/${userId}/budgets`),
            () => callback(),
            (error) => console.error('Budget listener error:', error)
        );

        // Store unsubscribers
        this.unsubscribers.push(unsubTransactions, unsubAssets, unsubBudgets);

        // Return combined unsubscribe function
        return () => {
            unsubTransactions();
            unsubAssets();
            unsubBudgets();
        };
    }

    // ===== Private Helper Methods =====

    /**
     * Ensure adapter is ready to use
     */
    private ensureReady(): void {
        if (!this.isReady()) {
            throw new Error('FirebaseAdapter not initialized or user not authenticated');
        }
    }

    /**
     * Get or create device ID
     */
    private getOrCreateDeviceId(): string {
        const key = 'device-id';
        let id = localStorage.getItem(key);

        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(key, id);
        }

        return id;
    }

    /**
     * Get current device ID
     */
    getDeviceId(): string {
        return this.deviceId;
    }

    /**
     * Get current user ID
     */
    getUserId(): string | null {
        return this.userId;
    }
}
