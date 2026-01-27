import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset, Transaction, Budget, AppSettings, Space, MonthlySummary, ChatMessage, InvestmentLog } from '../types';

interface AppState {
    transactions: Transaction[];
    assets: Asset[];
    investmentLogs: InvestmentLog[];
    budgets: Budget[];
    monthlySummaries: MonthlySummary[];
    chatMessages: ChatMessage[];
    settings: AppSettings;
    activeSpace: () => Space;
    // Transaction Actions
    addTransaction: (transaction: Transaction) => void;
    removeTransaction: (id: string) => void;
    updateTransaction: (transaction: Transaction) => void;
    // Asset Actions
    addAsset: (asset: Asset) => void;
    removeAsset: (id: string) => void;
    updateAsset: (asset: Asset) => void;
    // Investment Log Actions
    addInvestmentLog: (log: InvestmentLog) => void;
    removeInvestmentLog: (id: string) => void;
    // Budget Actions
    addBudget: (budget: Budget) => void;
    removeBudget: (id: string) => void;
    updateBudget: (budget: Budget) => void;
    // Monthly Summary Actions
    addMonthlySummary: (summary: MonthlySummary) => void;
    updateMonthlySummary: (summary: MonthlySummary) => void;
    deleteMonthlySummary: (id: string) => void;
    // Chat Actions
    addChatMessage: (message: ChatMessage) => void;
    clearChatHistory: (spaceId?: string) => void;
    // Settings & Space Actions
    updateSettings: (settings: Partial<AppSettings>) => void;
    addSpace: (name: string) => void;
    updateSpace: (id: string, name: string) => void;
    removeSpace: (id: string) => void;
    importData: (data: { assets: Asset[], budgets: Budget[], transactions: Transaction[], settings: AppSettings, monthlySummaries: MonthlySummary[], chatMessages: ChatMessage[], investmentLogs: InvestmentLog[] }) => void;
    // Guide Actions
    activeGuide: string | null;
    currentStep: number;
    startGuide: (guideId: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    stopGuide: () => void;
}

import CATEGORIES from '../data/categories.json';

// ... (AppState interface)

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            transactions: [],
            assets: [],
            investmentLogs: [],
            budgets: [],
            monthlySummaries: [],
            chatMessages: [],
            settings: {
                appName: 'Personal Wealth',
                currency: 'VND',
                language: 'en',
                theme: 'light', // Default will be overridden by persist if exists
                activeSpace: 'personal', // Default ID
                spaces: [
                    { id: 'personal', name: 'Personal' },
                    { id: 'family', name: 'Family' }
                ],
                budgetRules: { enforceUniqueCategory: true },
                categories: {
                    ...CATEGORIES.transaction,
                    investment: ['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto']
                },
                chat: {
                    enabled: false,
                    provider: 'gemini',
                    enableProactive: false
                }
            },

            // Helper to get full object of active space
            activeSpace: () => {
                const s = get().settings;
                return s.spaces.find(sp => sp.id === s.activeSpace) || s.spaces[0];
            },

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
            addInvestmentLog: (l) => set((state) => ({ investmentLogs: [l, ...state.investmentLogs] })),
            removeInvestmentLog: (id) => set((state) => ({ investmentLogs: state.investmentLogs.filter((l) => l.id !== id) })),
            addBudget: (b) => set((state) => ({ budgets: [...state.budgets, b] })),
            removeBudget: (id) => set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),
            updateBudget: (b) => set((state) => ({
                budgets: state.budgets.map((budget) => (budget.id === b.id ? b : budget)),
            })),
            addMonthlySummary: (s) => set((state) => ({ monthlySummaries: [...state.monthlySummaries, s] })),
            updateMonthlySummary: (s) => set((state) => ({
                monthlySummaries: state.monthlySummaries.map((summary) => (summary.id === s.id ? s : summary)),
            })),
            deleteMonthlySummary: (id) => set((state) => ({ monthlySummaries: state.monthlySummaries.filter((s) => s.id !== id) })),
            addChatMessage: (m) => set((state) => ({ chatMessages: [...state.chatMessages, m] })),
            clearChatHistory: (spaceId) => set((state) => ({
                chatMessages: spaceId ? state.chatMessages.filter((m) => m.spaceId !== spaceId) : []
            })),
            updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

            // Space Actions
            addSpace: (name) => set((state) => {
                const newSpace: Space = { id: crypto.randomUUID(), name };
                return {
                    settings: {
                        ...state.settings,
                        spaces: [...state.settings.spaces, newSpace],
                        activeSpace: newSpace.id // Switch to new space automatically? Optional.
                    }
                };
            }),
            updateSpace: (id, name) => set((state) => ({
                settings: {
                    ...state.settings,
                    spaces: state.settings.spaces.map(s => s.id === id ? { ...s, name } : s)
                }
            })),
            removeSpace: (id) => set((state) => {
                // Don't allow deleting the last space
                if (state.settings.spaces.length <= 1) return state;

                const newSpaces = state.settings.spaces.filter(s => s.id !== id);
                return {
                    settings: {
                        ...state.settings,
                        spaces: newSpaces,
                        activeSpace: state.settings.activeSpace === id ? newSpaces[0].id : state.settings.activeSpace
                    },
                    // Cleanup data associated with deleted space
                    transactions: state.transactions.filter(t => t.spaceId !== id),
                    assets: state.assets.filter(a => a.spaceId !== id),
                    budgets: state.budgets.filter(b => b.spaceId !== id),
                    monthlySummaries: state.monthlySummaries.filter(s => s.spaceId !== id),
                    chatMessages: state.chatMessages.filter(m => m.spaceId !== id)
                };
            }),

            importData: (data: { assets: Asset[], budgets: Budget[], transactions: Transaction[], settings: AppSettings, monthlySummaries: MonthlySummary[], chatMessages: ChatMessage[], investmentLogs: InvestmentLog[] }) => set(() => ({
                assets: data.assets,
                budgets: data.budgets,
                transactions: data.transactions,
                settings: data.settings,
                monthlySummaries: data.monthlySummaries,
                chatMessages: data.chatMessages || [],
                investmentLogs: data.investmentLogs || []
            })),

            // Guide Implementation
            activeGuide: null,
            currentStep: 0,
            startGuide: (guideId: string) => set({ activeGuide: guideId, currentStep: 0 }),
            nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
            prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
            stopGuide: () => set({ activeGuide: null, currentStep: 0 }),
        }),
        {
            name: 'finance-app-storage',
            version: 4, // Increment version to trigger migrate
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            migrate: (persistedState: any, version: number) => {
                let newState = { ...persistedState };

                // Migration from v0 or v1 to v2
                if (version < 2) {
                    // Create default spaces
                    const personalSpaceId = 'personal';
                    const familySpaceId = 'family';

                    // Initialize spaces in settings if not present
                    if (!newState.settings.spaces) {
                        newState.settings.spaces = [
                            { id: personalSpaceId, name: 'Personal' },
                            { id: familySpaceId, name: 'Family' }
                        ];
                    }

                    // Migrate activeProfile string to activeSpace ID
                    if (newState.settings.activeProfile) {
                        newState.settings.activeSpace = newState.settings.activeProfile === 'family' ? familySpaceId : personalSpaceId;
                        delete newState.settings.activeProfile;
                    }

                    // Migrate Transactions
                    if (Array.isArray(newState.transactions)) {
                        newState.transactions = newState.transactions.map((t: Transaction & { profile?: string }) => ({
                            ...t,
                            spaceId: t.profile === 'family' ? familySpaceId : personalSpaceId,
                            profile: undefined // Cleanup old field
                        }));
                    }

                    // Migrate Assets
                    if (Array.isArray(newState.assets)) {
                        newState.assets = newState.assets.map((a: Asset & { profile?: string }) => ({
                            ...a,
                            spaceId: a.profile === 'family' ? familySpaceId : personalSpaceId,
                            profile: undefined
                        }));
                    }

                    // Migrate Budgets
                    if (Array.isArray(newState.budgets)) {
                        newState.budgets = newState.budgets.map((b: Budget & { profile?: string }) => ({
                            ...b,
                            spaceId: b.profile === 'family' ? familySpaceId : personalSpaceId,
                            profile: undefined
                        }));
                    }
                }

                // Migration to v3: Ensure investment categories exist
                if (version < 3) {
                    if (newState.settings && newState.settings.categories && !newState.settings.categories.investment) {
                        newState.settings.categories = {
                            ...newState.settings.categories,
                            investment: ['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto']
                        };
                    }
                }

                // Migration to v4: Add App Name
                if (version < 4) {
                    if (!newState.settings.appName) {
                        newState.settings.appName = 'Personal Wealth';
                    }
                }

                return newState;
            }
        }
    )
);
