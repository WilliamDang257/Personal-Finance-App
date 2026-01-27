import { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import type { Transaction, TransactionType } from '../../types';
import { X } from 'lucide-react';


interface TransactionFormProps {
    onClose: () => void;
    initialData?: Transaction;
}

export function TransactionForm({ onClose, initialData }: TransactionFormProps) {
    const { addTransaction, updateTransaction, settings } = useStore();
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    // Initialize with correct defaults
    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setDescription(initialData.description);
            setDate(initialData.date);
            setNote(initialData.note || '');
        }
    }, [initialData]);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        // Reset category to default for the new type
        const list = newType === 'expense'
            ? (settings.categories?.expense || [])
            : (settings.categories?.income || []);
        if (list.length > 0) {
            setCategory(list[0]);
        } else {
            setCategory('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !description) return;

        const transactionData = {
            id: initialData ? initialData.id : crypto.randomUUID(),
            date,
            amount: parseFloat(amount),
            type,
            category,
            description,
            note,
            spaceId: initialData ? initialData.spaceId : settings.activeSpace,
        };

        if (initialData) {
            updateTransaction(transactionData);
        } else {
            addTransaction(transactionData);
        }
        onClose();
    };

    const currentCategories = type === 'income'
        ? (settings.categories?.income || [])
        : (settings.categories?.expense || []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg sm:w-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors border ${type === 'expense'
                                ? 'bg-red-500/10 border-red-500 text-red-500'
                                : 'bg-background border-input hover:bg-accent'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors border ${type === 'income'
                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                : 'bg-background border-input hover:bg-accent'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        >
                            {currentCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Description"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            placeholder="Optional note"
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {initialData ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}
