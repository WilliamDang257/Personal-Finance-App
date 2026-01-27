
import { useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { FormInput, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
    selectedDate: Date;
    viewMode: 'month' | 'year';
}

export function BudgetProgressCard({ selectedDate, viewMode }: Props) {
    const { transactions, budgets, settings } = useStore();

    const { budgetItems, timeProgress } = useMemo(() => {
        const targetMonth = selectedDate.getMonth();
        const targetYear = selectedDate.getFullYear();
        const now = new Date();
        let progress = 0;

        if (viewMode === 'year') {
            // Year Progress
            const startOfYear = new Date(targetYear, 0, 1);
            // const endOfYear = new Date(targetYear, 11, 31);
            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
            const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
            const totalDays = isLeap ? 366 : 365;

            if (now.getFullYear() > targetYear) progress = 100;
            else if (now.getFullYear() < targetYear) progress = 0;
            else progress = (dayOfYear / totalDays) * 100;
        } else {
            // Month Progress
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            if (now.getFullYear() > targetYear || (now.getFullYear() === targetYear && now.getMonth() > targetMonth)) {
                progress = 100;
            } else if (now.getFullYear() < targetYear || (now.getFullYear() === targetYear && now.getMonth() < targetMonth)) {
                progress = 0;
            } else {
                progress = (now.getDate() / daysInMonth) * 100;
            }
        }

        const activeSpace = settings.activeSpace;
        const activeBudgets = budgets.filter(b =>
            b.spaceId === activeSpace &&
            (b.year === targetYear || (!b.year && targetYear === new Date().getFullYear()))
        );

        const items = activeBudgets.map(budget => {
            // Limit Calculation
            let limit = 0;
            if (viewMode === 'year') {
                limit = budget.period === 'month' ? budget.amount * 12 : budget.amount;
            } else {
                limit = budget.period === 'month' ? budget.amount : budget.amount / 12;
            }

            // Spending Calculation
            const spent = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    const matchesSpace = t.type === 'expense' && t.spaceId === activeSpace && t.category === budget.category;
                    const matchesYear = d.getFullYear() === targetYear;
                    const matchesMonth = viewMode === 'month' ? d.getMonth() === targetMonth : true;
                    return matchesSpace && matchesYear && matchesMonth;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            const spendingProgress = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverbudget = spendingProgress > progress;

            return {
                category: budget.category,
                limit: limit,
                spent: spent,
                progress: spendingProgress,
                isOverbudget,
            };
        }).sort((a, b) => b.progress - a.progress);

        return { budgetItems: items, timeProgress: progress };
    }, [transactions, budgets, settings.activeSpace, selectedDate, viewMode]);

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
                        {viewMode === 'year' ? 'Year Progress' : 'Month Progress'}: <span className="font-medium text-foreground">{timeProgress.toFixed(1)}%</span>
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
                            {/* Marker */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10 opacity-50"
                                style={{ left: `${timeProgress}%` }}
                                title={`${viewMode === 'year' ? 'Year' : 'Month'} Progress: ${timeProgress.toFixed(1)}%`}
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
