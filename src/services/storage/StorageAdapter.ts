/**
 * Storage Adapter Interface
 * 
 * Defines a unified interface for different storage backends:
 * - Local: Browser localStorage
 * - Google Sheets: Manual sync to Google Sheets
 * - Firebase: Real-time cloud sync
 * - Hybrid: Local + Firebase for best performance
 */

import type { Transaction, Asset, Budget, AppSettings } from '../../types';

/**
 * Storage modes available
 */
export type StorageMode = 'local' | 'google-sheets' | 'firebase' | 'hybrid';

/**
 * Wrapper for syncable documents with metadata
 */
export interface SyncableDocument<T> {
    id: string;
    data: T;
    updatedAt: number;  // Unix timestamp
    deviceId: string;   // Device that made the change
}

/**
 * Base interface that all storage adapters must implement
 */
export interface StorageAdapter {
    // ===== Lifecycle =====

    /**
     * Initialize the adapter (connect to database, authenticate, etc.)
     */
    initialize(): Promise<void>;

    /**
     * Check if adapter is ready to use
     */
    isReady(): boolean;

    /**
     * Disconnect from storage and clean up resources
     */
    disconnect(): Promise<void>;

    // ===== Transactions =====

    /**
     * Get all transactions
     */
    getTransactions(): Promise<Transaction[]>;

    /**
     * Get a single transaction by ID
     */
    getTransaction(id: string): Promise<Transaction | null>;

    /**
     * Save a new transaction
     */
    saveTransaction(transaction: Transaction): Promise<void>;

    /**
     * Update an existing transaction
     */
    updateTransaction(transaction: Transaction): Promise<void>;

    /**
     * Delete a transaction
     */
    deleteTransaction(id: string): Promise<void>;

    // ===== Assets =====

    /**
     * Get all assets
     */
    getAssets(): Promise<Asset[]>;

    /**
     * Get a single asset by ID
     */
    getAsset(id: string): Promise<Asset | null>;

    /**
     * Save a new asset
     */
    saveAsset(asset: Asset): Promise<void>;

    /**
     * Update an existing asset
     */
    updateAsset(asset: Asset): Promise<void>;

    /**
     * Delete an asset
     */
    deleteAsset(id: string): Promise<void>;

    // ===== Budgets =====

    /**
     * Get all budgets
     */
    getBudgets(): Promise<Budget[]>;

    /**
     * Get a single budget by ID
     */
    getBudget(id: string): Promise<Budget | null>;

    /**
     * Save a new budget
     */
    saveBudget(budget: Budget): Promise<void>;

    /**
     * Update an existing budget
     */
    updateBudget(budget: Budget): Promise<void>;

    /**
     * Delete a budget
     */
    deleteBudget(id: string): Promise<void>;

    // ===== Settings =====

    /**
     * Get user settings
     */
    getSettings(): Promise<AppSettings | null>;

    /**
     * Save user settings
     */
    saveSettings(settings: AppSettings): Promise<void>;

    // ===== Sync Management =====

    /**
     * Get the last synchronization time
     * Returns null for adapters that don't sync (e.g., local-only)
     */
    getLastSyncTime(): Promise<Date | null>;

    /**
     * Manually trigger synchronization
     * No-op for adapters that don't sync
     */
    syncNow(): Promise<void>;

    /**
     * Subscribe to data changes (real-time updates)
     * Returns an unsubscribe function
     * 
     * @param callback Function to call when data changes
     * @returns Function to unsubscribe from changes
     */
    onDataChanged(callback: () => void): () => void;
}

/**
 * App data structure (for bulk operations)
 */
export interface AppData {
    transactions: Transaction[];
    assets: Asset[];
    budgets: Budget[];
    settings: AppSettings | null;
}
