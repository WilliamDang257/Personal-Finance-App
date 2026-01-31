/**
 * Local Storage Adapter
 * 
 * Stores all data in browser's localStorage.
 * Features:
 * - Offline-first (always available)
 * - Cross-tab sync (storage events)
 * - Device ID tracking
 * - No network required
 */

import type { StorageAdapter, AppData } from './StorageAdapter';
import type { Transaction, Asset, Budget, AppSettings, Reminder } from '../../types';

export class LocalStorageAdapter implements StorageAdapter {
    private readonly STORAGE_KEY = 'personal-finance-app-v2';
    private readonly DEVICE_ID_KEY = 'device-id';
    private deviceId: string;
    private ready = false;

    constructor() {
        this.deviceId = this.getOrCreateDeviceId();
    }

    // ===== Lifecycle =====

    async initialize(): Promise<void> {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('localStorage is not available in this browser');
        }
        this.ready = true;
    }

    isReady(): boolean {
        return this.ready && this.isLocalStorageAvailable();
    }

    async disconnect(): Promise<void> {
        // Nothing to disconnect for localStorage
        this.ready = false;
    }

    // ===== Transactions =====

    async getTransactions(): Promise<Transaction[]> {
        const data = this.loadData();
        return data.transactions || [];
    }

    async getTransaction(id: string): Promise<Transaction | null> {
        const transactions = await this.getTransactions();
        return transactions.find(t => t.id === id) || null;
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        const transactions = await this.getTransactions();
        transactions.push(transaction);
        await this.saveData({ transactions });
    }

    async updateTransaction(transaction: Transaction): Promise<void> {
        const transactions = await this.getTransactions();
        const index = transactions.findIndex(t => t.id === transaction.id);

        if (index === -1) {
            throw new Error(`Transaction ${transaction.id} not found`);
        }

        // Update directly
        transactions[index] = transaction;

        await this.saveData({ transactions });
    }

    async deleteTransaction(id: string): Promise<void> {
        const transactions = await this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        await this.saveData({ transactions: filtered });
    }

    // ===== Assets =====

    async getAssets(): Promise<Asset[]> {
        const data = this.loadData();
        return data.assets || [];
    }

    async getAsset(id: string): Promise<Asset | null> {
        const assets = await this.getAssets();
        return assets.find(a => a.id === id) || null;
    }

    async saveAsset(asset: Asset): Promise<void> {
        const assets = await this.getAssets();
        assets.push(asset);
        await this.saveData({ assets });
    }

    async updateAsset(asset: Asset): Promise<void> {
        const assets = await this.getAssets();
        const index = assets.findIndex(a => a.id === asset.id);

        if (index === -1) {
            throw new Error(`Asset ${asset.id} not found`);
        }

        assets[index] = asset;

        await this.saveData({ assets });
    }

    async deleteAsset(id: string): Promise<void> {
        const assets = await this.getAssets();
        const filtered = assets.filter(a => a.id !== id);
        await this.saveData({ assets: filtered });
    }

    // ===== Budgets =====

    async getBudgets(): Promise<Budget[]> {
        const data = this.loadData();
        return data.budgets || [];
    }

    async getBudget(id: string): Promise<Budget | null> {
        const budgets = await this.getBudgets();
        return budgets.find(b => b.id === id) || null;
    }

    async saveBudget(budget: Budget): Promise<void> {
        const budgets = await this.getBudgets();
        budgets.push(budget);
        await this.saveData({ budgets });
    }

    async updateBudget(budget: Budget): Promise<void> {
        const budgets = await this.getBudgets();
        const index = budgets.findIndex(b => b.id === budget.id);

        if (index === -1) {
            throw new Error(`Budget ${budget.id} not found`);
        }

        budgets[index] = budget;

        await this.saveData({ budgets });
    }

    async deleteBudget(id: string): Promise<void> {
        const budgets = await this.getBudgets();
        const filtered = budgets.filter(b => b.id !== id);
        await this.saveData({ budgets: filtered });
    }

    // ===== Settings =====

    async getSettings(): Promise<AppSettings | null> {
        const data = this.loadData();
        return data.settings || null;
    }

    async saveSettings(settings: AppSettings): Promise<void> {
        await this.saveData({ settings });
    }

    // ===== Reminders =====

    async getReminders(): Promise<Reminder[]> {
        const data = this.loadData();
        return data.reminders || [];
    }

    async saveReminder(reminder: Reminder): Promise<void> {
        const reminders = await this.getReminders();
        const index = reminders.findIndex(r => r.id === reminder.id);

        if (index >= 0) {
            reminders[index] = reminder;
        } else {
            reminders.push(reminder);
        }

        await this.saveData({ reminders });
    }

    async deleteReminder(id: string): Promise<void> {
        const reminders = await this.getReminders();
        const filtered = reminders.filter(r => r.id !== id);
        await this.saveData({ reminders: filtered });
    }

    // ===== Sync Management =====

    async getLastSyncTime(): Promise<Date | null> {
        // Local storage doesn't sync, return null
        return null;
    }

    async syncNow(): Promise<void> {
        // No-op for local storage
    }

    onDataChanged(callback: () => void): () => void {
        // Listen for storage events (cross-tab sync)
        const handler = (e: StorageEvent) => {
            if (e.key === this.STORAGE_KEY && e.oldValue !== e.newValue) {
                callback();
            }
        };

        window.addEventListener('storage', handler);

        // Return unsubscribe function
        return () => window.removeEventListener('storage', handler);
    }

    // ===== Private Helper Methods =====

    /**
     * Load all data from localStorage
     */
    private loadData(): AppData {
        const json = localStorage.getItem(this.STORAGE_KEY);
        if (!json) return this.getEmptyData();

        try {
            return JSON.parse(json);
        } catch (error) {
            console.error('Failed to parse localStorage data:', error);
            return this.getEmptyData();
        }
    }

    /**
     * Save data to localStorage
     */
    private async saveData(update: Partial<AppData>): Promise<void> {
        const existing = this.loadData();
        const merged = { ...existing, ...update };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            throw new Error('Failed to save data to local storage');
        }
    }

    /**
     * Get empty data structure
     */
    private getEmptyData(): AppData {
        return {
            transactions: [],
            assets: [],
            budgets: [],
            reminders: [],
            settings: null
        };
    }

    /**
     * Check if localStorage is available
     */
    private isLocalStorageAvailable(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get or create device ID
     */
    private getOrCreateDeviceId(): string {
        let id = localStorage.getItem(this.DEVICE_ID_KEY);

        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(this.DEVICE_ID_KEY, id);
        }

        return id;
    }

    /**
     * Get current device ID
     */
    getDeviceId(): string {
        return this.deviceId;
    }
}
