import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { TransactionForm } from './TransactionForm';
import { TransactionSummary } from './TransactionSummary';
import { Plus, Trash2, Search, Pencil, Filter, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Transaction } from '../../types';

export function TransactionsPage() {
    const { t } = useTranslation();
    const { transactions, removeTransaction, settings, syncTransactionsFromSheets } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount'>('date-desc');
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [isSyncing, setIsSyncing] = useState(false);

    const formatter = new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'en-US'), {
        style: 'currency',
        currency: settings.currency || 'VND',
    });

    const activeSpace = settings.activeSpace;

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                if (t.spaceId && t.spaceId !== activeSpace) return false;

                const matchesType = t.type === activeTab;

                const tDate = new Date(t.date);
                const matchesMonth = tDate.getMonth() === selectedMonth.getMonth() &&
                    tDate.getFullYear() === selectedMonth.getFullYear();

                const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                    t.category.toLowerCase().includes(search.toLowerCase());

                const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

                return matchesType && matchesMonth && matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
                if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
                if (sortBy === 'amount') return b.amount - a.amount;
                return 0;
            });
    }, [transactions, activeTab, search, categoryFilter, sortBy, selectedMonth, activeSpace]);

    const uniqueCategories = useMemo(() => {
        const cats = new Set(transactions.filter(t => t.type === activeTab).map(t => t.category));
        return Array.from(cats);
    }, [transactions, activeTab]);

    const handleAddNew = () => {
        setEditingTransaction(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingTransaction(undefined);
    };

    const handleSync = async () => {
        if (!settings.googleSheets?.enabled) {
            alert('Google Sheets sync is not configured. Please set it up in Settings.');
            return;
        }
        setIsSyncing(true);
        try {
            await syncTransactionsFromSheets(false);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t.transactions.title}</h2>
                <p className="text-muted-foreground mt-2">{t.transactions.subtitle}</p>
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
                            {t.transactions.expenses}
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
                            {t.transactions.income}
                        </button>
                    </div>
                </div>

                {/* Summary & Buttons Section */}
                <div>
                    <TransactionSummary type={activeTab} selectedMonth={selectedMonth} categoryFilter={categoryFilter} />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                        {/* Month Picker */}
                        <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                            <button
                                onClick={() => {
                                    const d = new Date(selectedMonth);
                                    d.setMonth(d.getMonth() - 1);
                                    setSelectedMonth(d);
                                }}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                                title="Previous Month"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-[140px] text-center font-medium">
                                {selectedMonth.toLocaleString(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'default'), { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => {
                                    const d = new Date(selectedMonth);
                                    d.setMonth(d.getMonth() + 1);
                                    setSelectedMonth(d);
                                }}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                                title="Next Month"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            {settings.googleSheets?.enabled && (
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Syncing...' : 'Sync'}
                                </button>
                            )}
                            <button
                                onClick={handleAddNew}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring ${activeTab === 'income' ? 'bg-emerald-600' : 'bg-red-600'
                                    }`}
                            >
                                <Plus className="h-4 w-4" />
                                {activeTab === 'income' ? t.transactions.addIncome : t.transactions.addExpense}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.transactions.searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring max-w-[150px]"
                        >
                            <option value="all">{t.transactions.allCategories}</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'amount')}
                        className="flex-1 sm:flex-none w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="date-desc">{t.transactions.newestFirst}</option>
                        <option value="date-asc">{t.transactions.oldestFirst}</option>
                        <option value="amount">{t.transactions.sortByAmount}</option>
                    </select>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        {t.transactions.noTransactions} {selectedMonth.toLocaleString(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'default'), { month: 'long' })}.
                    </div>
                ) : (
                    filteredTransactions.map(transaction => (
                        <div key={transaction.id} className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-foreground">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                                    </p>
                                </div>
                                <p className={cn(
                                    "font-semibold",
                                    transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                )}>
                                    {formatter.format(transaction.amount)}
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 mt-2 border-t pt-2">
                                <button
                                    onClick={() => handleEdit(transaction)}
                                    className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    <Pencil className="h-3 w-3" /> Edit
                                </button>
                                <button
                                    onClick={() => removeTransaction(transaction.id)}
                                    className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.transactions.date}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.transactions.description}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.transactions.category}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.transactions.amount}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.transactions.actions}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        {t.transactions.noTransactions} {selectedMonth.toLocaleString(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'default'), { month: 'long' })}.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
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
