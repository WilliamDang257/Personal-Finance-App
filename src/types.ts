export type Profile = 'personal' | 'family';

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
    profile: Profile;
}

export type AssetType = 'cash' | 'saving' | 'stock' | 'bond' | 'crypto' | 'gold' | 'real_estate' | 'receivable' | 'payable' | 'other' | string;

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    value: number;
    quantity?: number; // For stocks/crypto/gold
    pricePerUnit?: number; // Value of each unit
    profile: Profile;
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
    profile: Profile;
    subItems?: BudgetItem[];
}

// Prediction / Forecasting
export interface FinancialForecast {
    year: number;
    expectedIncome: number;
    expectedExpense: number;
    projectedSavings: number;
    projectedNetWorth: number;
}

export interface AppSettings {
    currency: string;
    theme: 'light' | 'dark' | 'system';
    activeProfile: Profile;
    budgetRules: {
        enforceUniqueCategory: boolean;
    };
    categories: {
        income: string[];
        expense: string[];
    };
}
