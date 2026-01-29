
import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { CalendarRange, Info } from 'lucide-react';

interface Props {
    selectedDate: Date;
    viewMode: 'month' | 'year';
}

export function YTDSpendingCard({ selectedDate, viewMode }: Props) {
    const { transactions, settings } = useStore();

    const totalSpent = useMemo(() => {
        const targetYear = selectedDate.getFullYear();
        const targetMonth = selectedDate.getMonth();
        const activeSpace = settings.activeSpace;

        return transactions.reduce((acc, t) => {
            const d = new Date(t.date);
            const matchesSpace = t.type === 'expense' && t.spaceId === activeSpace;
            const matchesYear = d.getFullYear() === targetYear;
            const matchesMonth = viewMode === 'month' ? d.getMonth() === targetMonth : true;

            if (matchesSpace && matchesYear && matchesMonth) {
                return acc + t.amount;
            }
            return acc;
        }, 0);
    }, [transactions, settings.activeSpace, selectedDate, viewMode]);

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
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{viewMode === 'year' ? 'Total Spending (Year)' : 'Monthly Spending'}</p>
                    <div className="group relative">
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help opacity-70 hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-gray-900/95 text-white text-xs shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[9999] border border-white/10">
                            <p className="font-semibold mb-1">Calculation:</p>
                            <p className="opacity-90 leading-relaxed">
                                Sum of all expense transactions in the selected {viewMode === 'year' ? 'year' : 'month'}.
                            </p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
                        </div>
                    </div>
                </div>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-red-500">
                    {formatter.format(totalSpent)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    {viewMode === 'year'
                        ? `Total expenses in ${selectedDate.getFullYear()}`
                        : `Total expenses in ${selectedDate.toLocaleString('default', { month: 'long' })}`
                    }
                </p>
            </div>
        </div>
    );
}
