import { NetWorthCard } from './NetWorthCard';
import { CashFlowChart } from './CashFlowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { AssetAllocationChart } from '../assets/AssetAllocationChart';
import { YTDSpendingCard } from './YTDSpendingCard';
import { BudgetProgressCard } from './BudgetProgressCard';

import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function DashboardPage() {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date());

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
                    <p className="text-muted-foreground mt-2">{t.dashboard.subtitle}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 bg-card border rounded-md p-1 shadow-sm">
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setFullYear(d.getFullYear() - 1);
                            setDate(d);
                        }}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Previous Year"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[100px] sm:min-w-[140px] text-center font-medium">
                        {date.getFullYear()}
                    </span>
                    <button
                        onClick={() => {
                            const now = new Date();
                            const d = new Date(date);
                            d.setFullYear(d.getFullYear() + 1);
                            // Prevent going to future year
                            if (d.getFullYear() > now.getFullYear()) return;
                            setDate(d);
                        }}
                        disabled={date.getFullYear() >= new Date().getFullYear()}
                        className="p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Next Year"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Top Row: Net Worth & Monthly Spending */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <NetWorthCard />
                </div>
                <div className="lg:col-span-1">
                    <YTDSpendingCard selectedDate={date} viewMode="year" />
                </div>
            </div>

            {/* Second Row: Budget Progress */}
            <div className="w-full">
                <BudgetProgressCard selectedDate={date} viewMode="year" />
            </div>

            {/* Third Row: Cash Flow */}
            <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6">
                <h3 className="font-semibold mb-4">Cash Flow ({date.getFullYear()})</h3>
                <div className="h-[300px] md:h-[350px]">
                    <CashFlowChart selectedDate={date} viewMode="year" />
                </div>
            </div>

            {/* Bottom Row: Breakdown & Allocation */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">
                        Category Spending ({date.getFullYear()})
                    </h3>
                    <div className="h-[300px] md:h-[350px]">
                        <CategoryBreakdown selectedDate={date} viewMode="year" />
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Overall Allocation</h3>
                    <div className="h-[300px] md:h-[350px]">
                        <AssetAllocationChart mode="summary" includeLiabilities={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
