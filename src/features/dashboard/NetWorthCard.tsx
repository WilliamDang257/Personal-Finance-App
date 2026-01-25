import { ArrowRight, Wallet, TrendingUp } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export function NetWorthCard() {
    const { assets, transactions, budgets, settings } = useStore();
    const activeSpace = settings.activeSpace;

    // 1. Calculate Current Stats
    const { totalAssets, liabilities, netWorth } = assets
        .filter(a => a.spaceId === activeSpace)
        .reduce((acc, curr) => {
            if (['payable', 'loan', 'credit'].includes(curr.type) || curr.bucket === 'payable') {
                acc.liabilities += curr.value;
                acc.netWorth -= curr.value;
            } else {
                acc.totalAssets += curr.value;
                acc.netWorth += curr.value;
            }
            return acc;
        }, { totalAssets: 0, liabilities: 0, netWorth: 0 });

    const debtRatio = totalAssets > 0 ? (liabilities / totalAssets) * 100 : 0;

    // 2. Calculate Prediction
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsPassed = now.getMonth() + 1; // Jan is 0, so passed is 1
    const remainingMonths = 12 - monthsPassed;

    // Income Projection
    const ytdIncome = transactions
        .filter(t =>
            t.type === 'income' &&
            t.spaceId === activeSpace &&
            new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);

    const avgMonthlyIncome = monthsPassed > 0 ? ytdIncome / monthsPassed : 0;
    const expectedRemainingIncome = avgMonthlyIncome * remainingMonths;

    // Expense Projection (Based on Remaining Budget)
    const totalYearlyBudget = budgets
        .filter(b => b.spaceId === activeSpace)
        .reduce((sum, b) => sum + b.amount, 0); // Assuming all budgets are yearly per new default

    const ytdExpense = transactions
        .filter(t =>
            t.type === 'expense' &&
            t.spaceId === activeSpace &&
            new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);

    // If over budget, assume 0 remaining planned expense (user already spent it all)
    const expectedRemainingExpense = Math.max(0, totalYearlyBudget - ytdExpense);

    const projectedNetWorth = netWorth + expectedRemainingIncome - expectedRemainingExpense;

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current Net Worth</p>
                    <h3 className="text-2xl font-bold tracking-tight text-primary">
                        {formatter.format(netWorth)}
                    </h3>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Assets</p>
                        <p className="text-lg font-semibold text-emerald-600">
                            {formatter.format(totalAssets)}
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-muted-foreground">Liabilities</p>
                            {debtRatio > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${debtRatio > 50 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {debtRatio.toFixed(1)}% Ratio
                                </span>
                            )}
                        </div>
                        <p className="text-lg font-semibold text-red-500">
                            {formatter.format(liabilities)}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">End-of-Year Projection</h4>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Projected Net Worth</span>
                            <span className="text-xl font-bold text-primary">{formatter.format(projectedNetWorth)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right mb-3">
                            (~{Math.round(((projectedNetWorth - netWorth) / Math.abs(netWorth || 1)) * 100)}% growth)
                        </p>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-emerald-600">
                                <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3" /> Expected Income ({remainingMonths} mos)</span>
                                <span className="font-medium">+{formatter.format(expectedRemainingIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                                <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3" /> Remaining Budget</span>
                                <span className="font-medium">-{formatter.format(expectedRemainingExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
