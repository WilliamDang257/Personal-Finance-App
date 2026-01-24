import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset, Transaction, Budget, AppSettings, Profile } from '../types';

interface AppState {
    transactions: Transaction[];
    assets: Asset[];
    budgets: Budget[];
    settings: AppSettings;
    activeProfile: () => Profile;
    addTransaction: (transaction: Transaction) => void;
    removeTransaction: (id: string) => void;
    updateTransaction: (transaction: Transaction) => void;
    addAsset: (asset: Asset) => void;
    removeAsset: (id: string) => void;
    updateAsset: (asset: Asset) => void;
    addBudget: (budget: Budget) => void;
    removeBudget: (id: string) => void;
    updateBudget: (budget: Budget) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
    loadDemoData: (data: { assets: Asset[], budgets: Budget[], transactions: Transaction[], settings: AppSettings }) => void;
}

import CATEGORIES from '../data/categories.json';

// ... (AppState interface)

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            transactions: [],
            assets: [],
            budgets: [],
            settings: {
                currency: 'VND',
                theme: 'light',
                activeProfile: 'personal',
                budgetRules: { enforceUniqueCategory: true },
                categories: CATEGORIES.transaction
            },
            activeProfile: () => get().settings.activeProfile,
            addTransaction: (t) => set((state) => ({ transactions: [t, ...state.transactions] })),
            removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),
            updateTransaction: (t) => set((state) => ({
                transactions: state.transactions.map((trans) => (trans.id === t.id ? t : trans)),
            })),
            addAsset: (a) => set((state) => ({ assets: [...state.assets, a] })),
            removeAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
            updateAsset: (a) => set((state) => ({
                assets: state.assets.map((asset) => (asset.id === a.id ? a : asset)),
            })),
            addBudget: (b) => set((state) => ({ budgets: [...state.budgets, b] })),
            removeBudget: (id) => set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),
            updateBudget: (b) => set((state) => ({
                budgets: state.budgets.map((budget) => (budget.id === b.id ? b : budget)),
            })),
            updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
            loadDemoData: (data) => set(() => ({
                assets: data.assets,
                budgets: data.budgets,
                transactions: data.transactions,
                settings: data.settings
            })),
        }),
        {
            name: 'finance-app-storage',
            version: 1,
            migrate: (persistedState: any, _version: number) => {
                if (!persistedState.settings.categories) {
                    persistedState.settings.categories = CATEGORIES.transaction;
                }
                return persistedState;
            }
        }
    )
);
