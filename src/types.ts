export interface Space {
    id: string;
    name: string;
}

export type TransactionType = 'income' | 'expense';

export type Category = {
    id: string;
    name: string;
    type: TransactionType;
};

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    type: TransactionType;
    spaceId: string;
    note?: string;
}

export interface MonthlySummary {
    id: string;
    month: number; // 0-11
    year: number;
    rating: number; // 1-5
    comment: string;
    spaceId: string;
}

export type AssetType = 'cash' | 'saving' | 'stock' | 'bond' | 'crypto' | 'gold' | 'real_estate' | 'receivable' | 'payable' | 'other' | string;

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    value: number;
    quantity?: number; // For stocks/crypto/gold
    pricePerUnit?: number; // Value of each unit
    spaceId: string;
    bucket: 'cash' | 'investment' | 'receivable' | 'payable';
    lastUpdated: string;
}

export interface BudgetItem {
    id: string;
    name: string;
    amount: number;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    period: 'month' | 'year';
    year: number;
    spaceId: string;
    subItems?: BudgetItem[];
}

export interface InvestmentLog {
    id: string;
    date: string;
    amount: number;
    note: string;
    spaceId: string;
}

// Prediction / Forecasting
export interface FinancialForecast {
    year: number;
    expectedIncome: number;
    expectedExpense: number;
    projectedSavings: number;
    projectedNetWorth: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    spaceId: string;
    tokens?: {
        prompt: number;
        response: number;
        total: number;
    };
}

export interface ChatSettings {
    enabled: boolean;
    provider: 'gemini';
    apiKey?: string;
    enableProactive: boolean;
}

export interface AppSettings {
    appName?: string;
    currency: string;
    language: 'en' | 'vi' | 'ko';
    theme: 'light' | 'dark' | 'system' | 'pink' | 'red';
    activeSpace: string;
    spaces: Space[];
    budgetRules: {
        enforceUniqueCategory: boolean;
    };
    categories: {
        income: string[];
        expense: string[];
        investment: string[];
    };
    chat: ChatSettings;
}
