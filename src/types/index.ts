export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    date: string; // ISO date string
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
}

export type AssetType = 'cash' | 'investment' | 'property' | 'crypto';

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    value: number;
    currency: string;
}

export interface AppSettings {
    currency: string;
    theme: 'dark' | 'light' | 'system';
}
