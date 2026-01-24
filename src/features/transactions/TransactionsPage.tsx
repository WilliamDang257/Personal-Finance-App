import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { TransactionForm } from './TransactionForm';
import { TransactionSummary } from './TransactionSummary';
import { Plus, Trash2, Search, Pencil, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Transaction } from '../../types';

export function TransactionsPage() {
    const { transactions, removeTransaction, settings } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

    const filtered = useMemo(() => {
        const activeProfile = settings.activeProfile;

        return transactions
            .filter(t => t.profile === activeProfile)
            .filter(t => t.type === activeTab)
            .filter(t => {
                const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                    t.category.toLowerCase().includes(search.toLowerCase());
                return matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === 'date') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                } else {
                    return b.amount - a.amount;
                }
            });
    }, [transactions, search, activeTab, sortBy, settings.activeProfile]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
    });

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingTransaction(undefined);
    };

    const handleAddNew = () => {
        setEditingTransaction(undefined);
        setIsFormOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                <p className="text-muted-foreground mt-2">Manage your income and expenses.</p>
            </div>

            {/* Tabs & Actions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-1.5",
                                activeTab === 'expense'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-1.5",
                                activeTab === 'income'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Income
                        </button>
                    </div>
                </div>

                {/* Summary & Buttons Section */}
                <div>
                    <TransactionSummary type={activeTab} />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleAddNew}
                            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring ${activeTab === 'income' ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                        >
                            <Plus className="h-4 w-4" />
                            Add {activeTab === 'income' ? 'Income' : 'Expense'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No {activeTab === 'income' ? 'income' : 'expense'} transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {transaction.category}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 whitespace-nowrap text-sm font-semibold text-right",
                                            transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                        )}>
                                            {formatter.format(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Edit transaction"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeTransaction(transaction.id)}
                                                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    aria-label="Delete transaction"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-md">
                        <TransactionForm initialData={editingTransaction} onClose={handleClose} />
                    </div>
                </div>
            )}
        </div>
    );
}
