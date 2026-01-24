import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';

interface TransactionSummaryProps {
    type: 'income' | 'expense';
}

export function TransactionSummary({ type }: TransactionSummaryProps) {
    const { transactions, settings } = useStore();

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    const summary = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const activeProfile = settings.activeProfile;

        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === type &&
                t.profile === activeProfile &&
                d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear;
        });

        const total = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0);

        const byCategory = currentMonthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        return { total, topCategories };
    }, [transactions, settings.activeProfile, type]);

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {type === 'income' ? 'Total Income' : 'Total Expenses'} (This Month)
                    </p>
                    <h3 className={`mt-1 text-3xl font-bold tracking-tight ${type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
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
