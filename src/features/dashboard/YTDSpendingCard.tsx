
import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { CalendarRange } from 'lucide-react';

export function YTDSpendingCard() {
    const { transactions, settings } = useStore();

    const totalSpent = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const activeSpace = settings.activeSpace;

        return transactions.reduce((acc, t) => {
            const d = new Date(t.date);
            if (t.type === 'expense' &&
                d.getFullYear() === currentYear &&
                t.spaceId === activeSpace) {
                return acc + t.amount;
            }
            return acc;
        }, 0);
    }, [transactions, settings.activeSpace]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-red-500/10 p-3 text-red-500">
                    <CalendarRange className="h-5 w-5" />
                </div>
            </div>

            <div>
                <p className="text-sm font-medium text-muted-foreground">YTD Spending</p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-red-500">
                    {formatter.format(totalSpent)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Total expenses in {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
