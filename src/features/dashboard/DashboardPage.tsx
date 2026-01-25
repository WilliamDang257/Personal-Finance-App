import { NetWorthCard } from './NetWorthCard';
import { RecentTransactions } from './RecentTransactions';
import { MonthlyReviewCard } from './MonthlyReviewCard';
import { CashFlowChart } from './CashFlowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { AssetAllocationChart } from '../assets/AssetAllocationChart';
import { YTDSpendingCard } from './YTDSpendingCard';
import { BudgetProgressCard } from './BudgetProgressCard';

export function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-2">Strategic overview of your financial health.</p>
            </div>

            {/* Top Row: Net Worth & YTD Spending */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <NetWorthCard />
                </div>
                <div className="lg:col-span-1">
                    <YTDSpendingCard />
                </div>
            </div>

            {/* Second Row: Budget Progress */}
            <div className="w-full">
                <BudgetProgressCard />
            </div>



            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Category Spending (YTD)</h3>
                    <div className="h-[400px]">
                        <CategoryBreakdown />
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Investment Portfolio</h3>
                    <div className="h-[400px]">
                        <AssetAllocationChart mode="details" activeTab="investment" />
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Overall Allocation</h3>
                    <div className="h-[400px]">
                        <AssetAllocationChart mode="summary" includeLiabilities={true} />
                    </div>
                </div>
            </div>

            {/* Fourth Row: Trends & Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
                <CashFlowChart />
                <MonthlyReviewCard />
            </div>

            <RecentTransactions />
        </div>
    );
}
