
import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { FormInput, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function BudgetProgressCard() {
    const { transactions, budgets, settings } = useStore();

    const { budgetItems, yearProgress } = useMemo(() => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const currentYear = now.getFullYear();
        const isLeap = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
        const totalDays = isLeap ? 366 : 365;
        const progress = (dayOfYear / totalDays) * 100;

        const activeSpace = settings.activeSpace;

        // Get active budgets for profile
        const activeBudgets = budgets.filter(b => b.spaceId === activeSpace);

        const items = activeBudgets.map(budget => {
            // Calculate Annual Budget Limit
            const annualLimit = budget.period === 'month' ? budget.amount * 12 : budget.amount;

            // Calculate YTD Spending for this category
            const ytdSpent = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === currentYear &&
                        t.type === 'expense' &&
                        t.category === budget.category &&
                        t.spaceId === activeSpace;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            const spendingProgress = annualLimit > 0 ? (ytdSpent / annualLimit) * 100 : 0;
            const isOverbudget = spendingProgress > progress;

            return {
                category: budget.category,
                limit: annualLimit,
                spent: ytdSpent,
                progress: spendingProgress,
                isOverbudget,
            };
        }).sort((a, b) => b.progress - a.progress); // Sort by highest consumption first

        return { budgetItems: items, yearProgress: progress };
    }, [transactions, budgets, settings.activeSpace]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                        <FormInput className="h-4 w-4" />
                        Budget Pacing
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Year Progress: <span className="font-medium text-foreground">{yearProgress.toFixed(1)}%</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {budgetItems.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        No budgets set for this profile.
                    </div>
                )}

                {budgetItems.map(item => (
                    <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.category}</span>
                            <div className="flex items-center gap-2">
                                <span className={item.isOverbudget ? "text-red-500 font-bold" : "text-emerald-500 font-medium"}>
                                    {formatter.format(item.spent)}
                                </span>
                                <span className="text-muted-foreground">
                                    / {formatter.format(item.limit)}
                                </span>
                            </div>
                        </div>

                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            {/* Year Progress Marker */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10 opacity-50"
                                style={{ left: `${yearProgress}%` }}
                                title={`Year Progress: ${yearProgress.toFixed(1)}%`}
                            />

                            {/* Spending Progress Bar */}
                            <div
                                className={`h-full transition-all ${item.isOverbudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(item.progress, 100)}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.progress.toFixed(1)}% used</span>
                            {item.isOverbudget && (
                                <span className="flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="h-3 w-3" />
                                    Pacing too fast
                                </span>
                            )}
                            {!item.isOverbudget && (
                                <span className="flex items-center gap-1 text-emerald-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                    On track
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
