import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import type { Budget } from '../../types';
import { X } from 'lucide-react';

interface BudgetSubItemFormProps {
    budget: Budget;
    onClose: () => void;
}

export function BudgetSubItemForm({ budget, onClose }: BudgetSubItemFormProps) {
    const { updateBudget } = useStore();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        const newItem = {
            id: crypto.randomUUID(),
            name,
            amount: parseFloat(amount),
        };

        const updatedSubItems = [...(budget.subItems || []), newItem];

        updateBudget({
            ...budget,
            subItems: updatedSubItems,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg sm:w-[350px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add Item to {budget.category}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Groceries"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Add Item
                    </button>
                </form>
            </div>
        </div>
    );
}
