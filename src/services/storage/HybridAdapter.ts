/**
 * Hybrid Storage Adapter
 * 
 * Combines LocalStorageAdapter and FirebaseAdapter for optimal performance.
 * Features:
 * - Fast local reads (no network delay)
 * - Automatic cloud backup (all writes go to both)
 * - Offline resilience (works without internet)
 * - Real-time sync across devices
 */

import { LocalStorageAdapter } from './LocalStorageAdapter';
import { FirebaseAdapter } from './FirebaseAdapter';
import type { StorageAdapter } from './StorageAdapter';
import type { Transaction, Asset, Budget, AppSettings } from '../../types';

export class HybridAdapter implements StorageAdapter {
    private localAdapter: LocalStorageAdapter;
    private firebaseAdapter: FirebaseAdapter;
    private syncInProgress = false;

    constructor() {
        this.localAdapter = new LocalStorageAdapter();
        this.firebaseAdapter = new FirebaseAdapter();
    }

    // ===== Lifecycle =====

    async initialize(): Promise<void> {
        // Initialize both adapters
        await this.localAdapter.initialize();
        await this.firebaseAdapter.initialize();

        // Sync from Firebase to local on startup
        await this.syncFromCloudToLocal();
    }

    isReady(): boolean {
        return this.localAdapter.isReady() && this.firebaseAdapter.isReady();
    }

    async disconnect(): Promise<void> {
        await Promise.all([
            this.localAdapter.disconnect(),
            this.firebaseAdapter.disconnect()
        ]);
    }

    // ===== Transactions =====
    // Read from local (fast), write to both (backup)

    async getTransactions(): Promise<Transaction[]> {
        return await this.localAdapter.getTransactions();
    }

    async getTransaction(id: string): Promise<Transaction | null> {
        return await this.localAdapter.getTransaction(id);
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        // Write to both in parallel
        await Promise.all([
            this.localAdapter.saveTransaction(transaction),
            this.firebaseAdapter.saveTransaction(transaction)
        ]);
    }

    async updateTransaction(transaction: Transaction): Promise<void> {
        await Promise.all([
            this.localAdapter.updateTransaction(transaction),
            this.firebaseAdapter.updateTransaction(transaction)
        ]);
    }

    async deleteTransaction(id: string): Promise<void> {
        await Promise.all([
            this.localAdapter.deleteTransaction(id),
            this.firebaseAdapter.deleteTransaction(id)
        ]);
    }

    // ===== Assets =====

    async getAssets(): Promise<Asset[]> {
        return await this.localAdapter.getAssets();
    }

    async getAsset(id: string): Promise<Asset | null> {
        return await this.localAdapter.getAsset(id);
    }

    async saveAsset(asset: Asset): Promise<void> {
        await Promise.all([
            this.localAdapter.saveAsset(asset),
            this.firebaseAdapter.saveAsset(asset)
        ]);
    }

    async updateAsset(asset: Asset): Promise<void> {
        await Promise.all([
            this.localAdapter.updateAsset(asset),
            this.firebaseAdapter.updateAsset(asset)
        ]);
    }

    async deleteAsset(id: string): Promise<void> {
        await Promise.all([
            this.localAdapter.deleteAsset(id),
            this.firebaseAdapter.deleteAsset(id)
        ]);
    }

    // ===== Budgets =====

    async getBudgets(): Promise<Budget[]> {
        return await this.localAdapter.getBudgets();
    }

    async getBudget(id: string): Promise<Budget | null> {
        return await this.localAdapter.getBudget(id);
    }

    async saveBudget(budget: Budget): Promise<void> {
        await Promise.all([
            this.localAdapter.saveBudget(budget),
            this.firebaseAdapter.saveBudget(budget)
        ]);
    }

    async updateBudget(budget: Budget): Promise<void> {
        await Promise.all([
            this.localAdapter.updateBudget(budget),
            this.firebaseAdapter.updateBudget(budget)
        ]);
    }

    async deleteBudget(id: string): Promise<void> {
        await Promise.all([
            this.localAdapter.deleteBudget(id),
            this.firebaseAdapter.deleteBudget(id)
        ]);
    }

    // ===== Settings =====

    async getSettings(): Promise<AppSettings | null> {
        return await this.localAdapter.getSettings();
    }

    async saveSettings(settings: AppSettings): Promise<void> {
        await Promise.all([
            this.localAdapter.saveSettings(settings),
            this.firebaseAdapter.saveSettings(settings)
        ]);
    }

    // ===== Sync Management =====

    async getLastSyncTime(): Promise<Date | null> {
        // Use Firebase's sync time
        return await this.firebaseAdapter.getLastSyncTime();
    }

    async syncNow(): Promise<void> {
        if (this.syncInProgress) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        this.syncInProgress = true;

        try {
            await this.syncFromCloudToLocal();
        } finally {
            this.syncInProgress = false;
        }
    }

    onDataChanged(callback: () => void): () => void {
        // Listen to Firebase changes (cloud is source of truth)
        const firebaseUnsub = this.firebaseAdapter.onDataChanged(async () => {
            // When Firebase data changes, sync to local
            await this.syncFromCloudToLocal();
            callback();
        });

        // Also listen to local changes (for cross-tab sync)
        const localUnsub = this.localAdapter.onDataChanged(() => {
            callback();
        });

        // Return combined unsubscribe function
        return () => {
            firebaseUnsub();
            localUnsub();
        };
    }

    // ===== Private Helper Methods =====

    /**
     * Sync data from Firebase (cloud) to localStorage
     * Cloud is source of truth for conflict resolution
     */
    private async syncFromCloudToLocal(): Promise<void> {
        try {
            // Get all data from Firebase
            const [transactions, assets, budgets, settings] = await Promise.all([
                this.firebaseAdapter.getTransactions(),
                this.firebaseAdapter.getAssets(),
                this.firebaseAdapter.getBudgets(),
                this.firebaseAdapter.getSettings()
            ]);

            // Get local data for comparison
            const [localTransactions, localAssets, localBudgets] = await Promise.all([
                this.localAdapter.getTransactions(),
                this.localAdapter.getAssets(),
                this.localAdapter.getBudgets()
            ]);

            // Sync transactions
            await this.syncCollection(
                transactions,
                localTransactions,
                (t) => this.localAdapter.saveTransaction(t),
                (t) => this.localAdapter.updateTransaction(t),
                (id) => this.localAdapter.deleteTransaction(id)
            );

            // Sync assets
            await this.syncCollection(
                assets,
                localAssets,
                (a) => this.localAdapter.saveAsset(a),
                (a) => this.localAdapter.updateAsset(a),
                (id) => this.localAdapter.deleteAsset(id)
            );

            // Sync budgets
            await this.syncCollection(
                budgets,
                localBudgets,
                (b) => this.localAdapter.saveBudget(b),
                (b) => this.localAdapter.updateBudget(b),
                (id) => this.localAdapter.deleteBudget(id)
            );

            // Sync settings
            if (settings) {
                await this.localAdapter.saveSettings(settings);
            }

            console.log('✅ Cloud → Local sync complete');
        } catch (error) {
            console.error('Failed to sync from cloud to local:', error);
            throw error;
        }
    }

    /**
     * Generic collection sync helper
     */
    private async syncCollection<T extends { id: string }>(
        cloudItems: T[],
        localItems: T[],
        save: (item: T) => Promise<void>,
        update: (item: T) => Promise<void>,
        deleteItem: (id: string) => Promise<void>
    ): Promise<void> {
        const localMap = new Map(localItems.map(item => [item.id, item]));
        const cloudMap = new Map(cloudItems.map(item => [item.id, item]));

        // Add or update items from cloud
        for (const cloudItem of cloudItems) {
            const localItem = localMap.get(cloudItem.id);

            if (!localItem) {
                // New item, save to local
                await save(cloudItem);
            } else {
                // Existing item, update if different
                if (JSON.stringify(cloudItem) !== JSON.stringify(localItem)) {
                    await update(cloudItem);
                }
            }
        }

        // Delete items that exist locally but not in cloud
        for (const localItem of localItems) {
            if (!cloudMap.has(localItem.id)) {
                await deleteItem(localItem.id);
            }
        }
    }
}
