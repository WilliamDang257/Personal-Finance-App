
import { useStore } from '../../hooks/useStore';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';


interface Props {
    selectedDate?: Date;
    viewMode?: 'month' | 'year';
}

export function RecentTransactions({ selectedDate, viewMode = 'month' }: Props) {
    const { transactions, settings } = useStore();

    // Sort by date desc and take top 5
    const activeSpace = settings.activeSpace;
    const recentTransactions = [...transactions]
        .filter(t => {
            if (t.spaceId !== activeSpace) return false;
            // Filter by date if provided
            if (selectedDate) {
                const d = new Date(t.date);
                const matchesYear = d.getFullYear() === selectedDate.getFullYear();
                const matchesMonth = viewMode === 'month' ? d.getMonth() === selectedDate.getMonth() : true;
                return matchesYear && matchesMonth;
            }
            return true;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
    });

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <h3 className="font-semibold leading-none tracking-tight">Recent Transactions</h3>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-4">
                    {recentTransactions.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">No transactions yet.</p>
                    )}
                    {recentTransactions.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("rounded-full p-2", item.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                    {item.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.description}</p>
                                    <p className="text-xs text-muted-foreground">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className={cn("font-medium", item.type === 'income' ? "text-green-500" : "text-foreground")}>
                                {item.type === 'income' ? '+' : '-'}{formatter.format(item.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
