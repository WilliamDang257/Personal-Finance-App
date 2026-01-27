import type { Asset, Budget, Transaction, AppSettings } from '../types';

export const generateDemoData = () => {
    const spaceId = 'personal';
    const now = new Date();

    // Helper to get date string relative to now
    const getDate = (daysAgo: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    };

    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Exchange rate: 1 USD = 26,000 VND
    // Scaling values to be realistic in VND (Millions/Billions)

    // --- 1. Diverse Assets ---
    const assets: Asset[] = [
        // Cash
        {
            id: 'demo-cash-1',
            name: 'Checking Account (VCB)',
            type: 'Bank Deposit',
            value: 220000000, // ~8.5k USD
            spaceId,
            bucket: 'cash',
            lastUpdated: getDate(0)
        },
        {
            id: 'demo-cash-2',
            name: 'Savings Term (TPBank)',
            type: 'saving',
            value: 500000000, // ~20k USD
            spaceId,
            bucket: 'cash',
            lastUpdated: getDate(5)
        },
        {
            id: 'demo-cash-3',
            name: 'Wallet Cash',
            type: 'cash',
            value: 12000000, // ~450 USD
            spaceId,
            bucket: 'cash',
            lastUpdated: getDate(1)
        },

        // Investment
        {
            id: 'demo-inv-1',
            name: 'FPT Corp (FPT)',
            type: 'stock',
            value: 390000000, // ~15k USD
            quantity: 3000,
            pricePerUnit: 130000,
            spaceId,
            bucket: 'investment',
            lastUpdated: getDate(1)
        },
        {
            id: 'demo-inv-2',
            name: 'Vinamilk (VNM)',
            type: 'stock',
            value: 650000000, // ~25k USD
            quantity: 10000,
            pricePerUnit: 65000,
            spaceId,
            bucket: 'investment',
            lastUpdated: getDate(1)
        },
        {
            id: 'demo-inv-3',
            name: 'Bitcoin (BTC)',
            type: 'crypto',
            value: 1690000000, // ~65k USD
            quantity: 0.85,
            pricePerUnit: 1988000000,
            spaceId,
            bucket: 'investment',
            lastUpdated: getDate(0)
        },
        {
            id: 'demo-inv-4',
            name: 'Ethereum (ETH)',
            type: 'crypto',
            value: 312000000, // ~12k USD
            quantity: 4.5,
            pricePerUnit: 69300000,
            spaceId,
            bucket: 'investment',
            lastUpdated: getDate(0)
        },
        {
            id: 'demo-inv-5',
            name: 'Vinhomes Apt (Ocean Park)',
            type: 'real_estate',
            value: 9100000000, // ~350k USD
            spaceId,
            bucket: 'investment',
            lastUpdated: getDate(30)
        },

        // Liabilities
        {
            id: 'demo-liab-1',
            name: 'Credit Card (VIB)',
            type: 'credit',
            value: 32500000, // ~1.2k USD
            spaceId,
            bucket: 'payable',
            lastUpdated: getDate(2)
        },
        {
            id: 'demo-liab-2',
            name: 'Car Loan (VinFast)',
            type: 'loan',
            value: 468000000, // ~18k USD
            spaceId,
            bucket: 'payable',
            lastUpdated: getDate(30)
        }
    ];

    // --- 2. Detailed Budgets ---
    // --- 2. Detailed Budgets ---
    const createBudgetsForYear = (year: number): Budget[] => [
        {
            id: `demo-budget-housing-${year}`,
            category: 'Housing',
            amount: 624000000, // ~24k USD
            period: 'year',
            year,
            spaceId,
            subItems: [
                { id: `sub-1-${year}`, name: 'Rent/Mortgage', amount: 468000000 },
                { id: `sub-2-${year}`, name: 'Utilities', amount: 78000000 },
                { id: `sub-3-${year}`, name: 'Maintenance', amount: 78000000 }
            ]
        },
        {
            id: `demo-budget-food-${year}`,
            category: 'Food',
            amount: 218400000, // ~8.4k USD
            period: 'year',
            year,
            spaceId,
            subItems: [
                { id: `sub-4-${year}`, name: 'Groceries', amount: 156000000 },
                { id: `sub-5-${year}`, name: 'Dining Out', amount: 62400000 }
            ]
        },
        {
            id: `demo-budget-transport-${year}`,
            category: 'Transportation',
            amount: 156000000, // ~6k USD
            period: 'year',
            year,
            spaceId,
            subItems: [
                { id: `sub-6-${year}`, name: 'Fuel', amount: 78000000 },
                { id: `sub-7-${year}`, name: 'Car Insurance', amount: 31200000 },
                { id: `sub-8-${year}`, name: 'Services', amount: 46800000 }
            ]
        },
        {
            id: `demo-budget-entertainment-${year}`,
            category: 'Entertainment',
            amount: 93600000, // ~3.6k USD
            period: 'year',
            year,
            spaceId,
        },
        {
            id: `demo-budget-shopping-${year}`,
            category: 'Shopping',
            amount: 124800000, // ~4.8k USD
            period: 'year',
            year,
            spaceId,
        }
    ];

    const budgets: Budget[] = [
        ...createBudgetsForYear(2026),
        ...createBudgetsForYear(2025)
    ];

    // --- 3. Realistic Transactions (2 Years covering 2024-2025) ---
    const transactions: Transaction[] = [];
    const categories = ['Food', 'Transportation', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Education', 'Travel'];

    // Monthly Recurring (Salary & Rent) for 24 months
    for (let i = 0; i < 24; i++) {
        // Salary (Income) - ~5.5k USD = 143M VND
        transactions.push({
            id: crypto.randomUUID(),
            date: getDate(i * 30 + 15), // Mid-month
            amount: 143000000,
            category: 'Salary',
            description: 'Monthly Salary',
            type: 'income',
            spaceId
        });

        // Rent (Expense) - ~1.5k USD = 39M VND
        transactions.push({
            id: crypto.randomUUID(),
            date: getDate(i * 30 + 1), // 1st of month
            amount: 39000000,
            category: 'Housing',
            description: 'Monthly Rent',
            type: 'expense',
            spaceId
        });
    }

    // Random Daily Expenses
    for (let i = 0; i < 400; i++) { // Generate ~400 random transactions over 2 years
        const daysAgo = getRandomInt(0, 730);
        const category = categories[getRandomInt(0, categories.length - 1)];
        let amount = 0;
        let description = '';

        switch (category) {
            case 'Food':
                amount = getRandomInt(400000, 4000000); // 400k - 4M VND
                description = Math.random() > 0.5 ? 'Groceries' : 'Restaurant';
                break;
            case 'Transportation':
                amount = getRandomInt(100000, 2000000); // 100k - 2M VND
                description = 'Fuel / Grab';
                break;
            case 'Entertainment':
                amount = getRandomInt(500000, 2500000); // 500k - 2.5M VND
                description = 'Movies / Netflix / Games';
                break;
            case 'Shopping':
                amount = getRandomInt(1000000, 8000000); // 1M - 8M VND
                description = 'Shopee / Clothing';
                break;
            case 'Health':
                amount = getRandomInt(500000, 3000000); // 500k - 3M VND
                description = 'Pharmacy / Gym';
                break;
            case 'Travel':
                amount = getRandomInt(2000000, 15000000); // 2M - 15M VND
                description = 'Flight / Hotel / Trip';
                break;
            default:
                amount = getRandomInt(500000, 2000000);
                description = 'Misc Expense';
        }

        transactions.push({
            id: crypto.randomUUID(),
            date: getDate(daysAgo),
            amount,
            category,
            description,
            type: 'expense',
            spaceId
        });
    }

    // Add a few big investment returns (Income)
    transactions.push({
        id: crypto.randomUUID(),
        date: getDate(45),
        amount: 31200000, // ~1.2k USD
        category: 'Investment',
        description: 'Dividend Payout',
        type: 'income',
        spaceId
    });
    transactions.push({
        id: crypto.randomUUID(),
        date: getDate(180),
        amount: 22100000, // ~850 USD
        category: 'Freelance',
        description: 'Side Project',
        type: 'income',
        spaceId
    });

    // --- 4. Investment Logs ---
    const investmentLogs: any[] = []; // Using any to avoid import circular dependency if types not updated yet, but ideally use InvestmentLog
    // Create logs for initial capital
    assets.filter(a => a.bucket === 'investment' || a.type === 'stock' || a.type === 'crypto' || a.type === 'real_estate').forEach(asset => {
        // Assume invested amount is slightly less than current value (profit)
        const investedAmount = Math.floor(asset.value * 0.85);
        investmentLogs.push({
            id: crypto.randomUUID(),
            date: getDate(300), // Bought ~10 months ago
            amount: investedAmount,
            note: `Initial Buy: ${asset.name}`,
            spaceId
        });
    });

    // --- 5. Settings ---
    const settings: AppSettings = {
        currency: 'VND',
        theme: 'light',
        activeSpace: 'personal',
        spaces: [
            { id: 'personal', name: 'Personal' },
            { id: 'family', name: 'Family' }
        ],
        budgetRules: { enforceUniqueCategory: true },
        categories: {
            expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Education', 'Travel', 'Utilities'],
            income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
            investment: ['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto']
        },
        language: 'en',
        chat: {
            enabled: false,
            provider: 'gemini',
            enableProactive: false
        },
        security: {
            enabled: false
        }
    };

    return { assets, budgets, transactions, settings, monthlySummaries: [], investmentLogs };
};
