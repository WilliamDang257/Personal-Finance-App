import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { cn } from '../../lib/utils';

export interface TransactionSummaryProps {
    type: 'income' | 'expense' | 'all';
    selectedMonth: Date;
    categoryFilter: string;
}

export function TransactionSummary({ type, selectedMonth, categoryFilter }: TransactionSummaryProps) {
    const { transactions, settings } = useStore();

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    const summary = useMemo(() => {
        const currentMonth = selectedMonth.getMonth();
        const currentYear = selectedMonth.getFullYear();
        const activeSpace = settings.activeSpace;

        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            const matchesType = type === 'all' ? true : t.type === type;
            const matchesSpace = t.spaceId === activeSpace;
            const matchesDate = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            const matchesCategory = categoryFilter === 'all' ? true : t.category === categoryFilter;

            return matchesType && matchesSpace && matchesDate && matchesCategory;
        });

        const total = currentMonthTransactions.reduce((acc, t) => {
            if (type === 'all') {
                return acc + (t.type === 'income' ? t.amount : -t.amount);
            }
            return acc + t.amount;
        }, 0);

        const byCategory = currentMonthTransactions.reduce((acc, t) => {
            // For 'all', we might want to group by category regardless of type?
            // Or maybe just show top categories by absolute amount?
            // Let's grouping normally.
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        return { total, topCategories };
    }, [transactions, settings.activeSpace, type, selectedMonth, categoryFilter]);

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {type === 'income' ? 'Total Income' : type === 'expense' ? 'Total Expenses' : 'Net Flow'} ({selectedMonth.toLocaleString('default', { month: 'long' })})
                    </p>
                    <h3 className={cn("mt-1 text-3xl font-bold tracking-tight",
                        type === 'income' ? 'text-emerald-600' :
                            type === 'expense' ? 'text-red-600' :
                                summary.total >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                        {formatter.format(summary.total)}
                    </h3>
                </div>

                {summary.topCategories.length > 0 && (
                    <div className="flex-1 w-full sm:w-auto overflow-x-auto">
                        <div className="flex gap-4 sm:justify-end">
                            {summary.topCategories.map((item) => (
                                <div key={item.category} className="min-w-[100px] shrink-0 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-xs font-medium text-muted-foreground truncate" title={item.category}>
                                        {item.category}
                                    </p>
                                    <p className="font-semibold text-sm">
                                        {formatter.format(item.amount)}
                                    </p>
                                    <div className="w-full bg-background h-1.5 rounded-full mt-1.5 overflow-hidden">
                                        <div
                                            className={`h-full ${type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                            style={{ width: `${(item.amount / summary.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
