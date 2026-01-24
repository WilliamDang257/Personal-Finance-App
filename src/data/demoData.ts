import type { Asset, Budget, Transaction, AppSettings, Profile } from '../types';

export const generateDemoData = () => {
    const profile: Profile = 'personal';
    const now = new Date();

    // Helper to get date string relative to now
    const getDate = (daysAgo: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    };

    const assets: Asset[] = [
        {
            id: 'demo-asset-1',
            name: 'Checking Account',
            type: 'Bank Deposit',
            value: 5000,
            profile,
            bucket: 'cash',
            lastUpdated: getDate(0)
        },
        {
            id: 'demo-asset-2',
            name: 'Tech Growth Stock',
            type: 'Stock',
            value: 12000,
            quantity: 50,
            pricePerUnit: 240,
            profile,
            bucket: 'investment',
            lastUpdated: getDate(1)
        },
        {
            id: 'demo-asset-3',
            name: 'Bitcoin Reserve',
            type: 'Crypto',
            value: 45000,
            quantity: 0.5,
            pricePerUnit: 90000,
            profile,
            bucket: 'investment',
            lastUpdated: getDate(0)
        },
        {
            id: 'demo-asset-4',
            name: 'Credit Card',
            type: 'credit',
            value: 1500,
            profile,
            bucket: 'payable',
            lastUpdated: getDate(2)
        }
    ];

    const budgets: Budget[] = [
        {
            id: 'demo-budget-1',
            category: 'Food',
            amount: 6000, // Yearly
            period: 'year',
            profile,
            subItems: [
                { id: 'sub-1', name: 'Groceries', amount: 4000 },
                { id: 'sub-2', name: 'Dining Out', amount: 2000 }
            ]
        },
        {
            id: 'demo-budget-2',
            category: 'Shopping',
            amount: 3000,
            period: 'year',
            profile,
        },
        {
            id: 'demo-budget-3',
            category: 'Travel',
            amount: 5000,
            period: 'year',
            profile,
        }
    ];

    const transactions: Transaction[] = [
        { id: 't1', date: getDate(1), amount: 150, category: 'Food', description: 'Weekly Groceries', type: 'expense', profile },
        { id: 't2', date: getDate(3), amount: 50, category: 'Food', description: 'Lunch w/ friends', type: 'expense', profile },
        { id: 't3', date: getDate(5), amount: 120, category: 'Transport', description: 'Gas refill', type: 'expense', profile },
        { id: 't4', date: getDate(10), amount: 2000, category: 'Salary', description: 'Monthly Salary', type: 'income', profile },
        { id: 't5', date: getDate(12), amount: 500, category: 'Shopping', description: 'New Shoes', type: 'expense', profile },
        { id: 't6', date: getDate(15), amount: 100, category: 'Entertainment', description: 'Cinema', type: 'expense', profile },
        { id: 't7', date: getDate(20), amount: 300, category: 'Utilities', description: 'Electricity Bill', type: 'expense', profile },
    ];

    const settings: AppSettings = {
        currency: 'USD',
        theme: 'light',
        activeProfile: 'personal',
        budgetRules: { enforceUniqueCategory: true },
        categories: {
            expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Travel'],
            income: ['Salary', 'Freelance', 'Investment', 'Other']
        }
    };

    return { assets, budgets, transactions, settings };
};
