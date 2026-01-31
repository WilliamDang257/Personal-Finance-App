import { useState, useEffect } from 'react';

import { useStore } from '../../hooks/useStore';
import type { Budget } from '../../types';
import { X } from 'lucide-react';

interface BudgetFormProps {
    onClose: () => void;
    initialData?: Budget;
    year: number;
}

export function BudgetForm({ onClose, initialData, year }: BudgetFormProps) {
    const { addBudget, updateBudget, settings, budgets } = useStore();
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState(''); // Formatted display value
    // const [period, setPeriod] = useState<'month' | 'year'>('month'); // Removed state

    // Format number with thousand separators
    const formatNumber = (value: string): string => {
        if (!value) return '';
        const num = value.replace(/[^\d]/g, ''); // Remove non-digits
        if (!num) return '';
        return parseInt(num).toLocaleString('en-US'); // Format with commas
    };

    // Handle amount input with live formatting
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Remove all non-digits
        const numericValue = input.replace(/[^\d]/g, '');

        // Update actual value (numbers only)
        setAmount(numericValue);

        // Update display value (formatted)
        setDisplayAmount(formatNumber(numericValue));
    };

    useEffect(() => {
        if (initialData) {
            setCategory(initialData.category);
            const amountStr = initialData.amount.toString();
            setAmount(amountStr);
            setDisplayAmount(formatNumber(amountStr));
            // setPeriod(initialData.period);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount) return;

        // Validation: Unique Category
        if (settings.budgetRules?.enforceUniqueCategory) {
            const isDuplicate = budgets.some(b =>
                b.category === category &&
                b.year === year &&
                b.spaceId === (initialData ? initialData.spaceId : settings.activeSpace) &&
                b.id !== (initialData ? initialData.id : '')
            );

            if (isDuplicate) {
                alert(`A budget for this category already exists for ${year}.`);
                return;
            }
        }

        const budgetData = {
            id: initialData ? initialData.id : crypto.randomUUID(),
            category,
            amount: parseFloat(amount),
            period: 'year' as const, // Force yearly
            year,
            spaceId: initialData ? initialData.spaceId : settings.activeSpace,
            subItems: initialData?.subItems || [],
        };

        if (initialData) {
            updateBudget(budgetData);
        } else {
            addBudget(budgetData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg sm:w-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{initialData ? 'Edit Budget' : 'Set Budget'} ({year})</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        >
                            <option value="">Select a category</option>
                            {(settings.categories?.expense || []).map((cat: string) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Limit Amount ({settings.currency})</label>
                        <input
                            type="text"
                            value={displayAmount}
                            onChange={handleAmountChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                            placeholder="0"
                            required
                        />
                    </div>



                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {initialData ? 'Update Budget' : 'Set Budget'}
                    </button>
                </form>
            </div >
        </div >
    );
}
