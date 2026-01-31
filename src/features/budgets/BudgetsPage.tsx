import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { BudgetForm } from './BudgetForm';
import { BudgetSubItemForm } from './BudgetSubItemForm';
import { BudgetDistributionChart } from './BudgetDistributionChart';
import { Plus, Trash2, Pencil, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Budget } from '../../types';
import { cn } from '../../lib/utils';

export function BudgetsPage() {
    const { t } = useTranslation();
    const { budgets, transactions, removeBudget, updateBudget, settings } = useStore();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);
    const [subItemFormTarget, setSubItemFormTarget] = useState<Budget | undefined>(undefined);

    const formatter = new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'en-US'), {
        style: 'currency',
        currency: settings.currency || 'VND',
        maximumFractionDigits: 0
    });

    const activeSpace = settings.activeSpace;

    const budgetProgress = useMemo(() => {
        const spaceBudgets = budgets.filter(b => b.spaceId === activeSpace && b.year === selectedYear);

        return spaceBudgets.map(budget => {
            // Calculate spent amount for this category in the current month/year
            // For now, assuming monthly budgets invoke checking current month's transactions
            // Ideally, we'd have a period selector (Month/Year) for the view.
            // Let's assume the view is "Current Month Status" for Monthly budgets 
            // and "Year to Date" for Yearly budgets.

            const now = new Date();
            const currentMonth = now.getMonth();

            const relevantTransactions = transactions.filter(t => {
                if (t.spaceId !== activeSpace) return false;
                if (t.type !== 'expense') return false;
                if (t.category !== budget.category && t.category !== budget.id) return false; // Handle both name and ID matching if needed

                const tDate = new Date(t.date);
                if (tDate.getFullYear() !== selectedYear) return false;

                if (budget.period === 'month') {
                    return tDate.getMonth() === currentMonth;
                }
                return true;
            });

            const spent = relevantTransactions.reduce((acc, t) => acc + t.amount, 0);
            const percentage = Math.min((spent / budget.amount) * 100, 100);

            return {
                ...budget,
                spent,
                percentage,
                isOverBudget: spent > budget.amount
            };
        });
    }, [budgets, transactions, activeSpace, selectedYear]);

    const totalBudget = budgetProgress.reduce((acc, b) => acc + b.amount, 0);

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingBudget(undefined);
    };

    const onRemoveSubItem = (budget: Budget, subItemId: string) => {
        if (!budget.subItems) return;
        const updatedSubItems = budget.subItems.filter(item => item.id !== subItemId);
        updateBudget({ ...budget, subItems: updatedSubItems });
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* ... Header ... */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.budgets.title}</h2>
                    <p className="text-muted-foreground mt-2">
                        {t.budgets.totalYearlyBudget}: <span className="font-semibold text-primary">{formatter.format(totalBudget)}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
                        <button
                            onClick={() => setSelectedYear(y => y - 1)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="Previous Year"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <span className="min-w-[80px] text-center font-medium">
                            {selectedYear}
                        </span>
                        <button
                            onClick={() => setSelectedYear(y => y + 1)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="Next Year"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <Plus className="h-4 w-4" />
                        {t.budgets.addCategory}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <BudgetDistributionChart year={selectedYear} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {budgetProgress.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground p-6 border rounded-xl bg-card col-span-full">
                        <p>{t.budgets.noBudgets}</p>
                    </div>
                )}
                {budgetProgress.length > 0 && budgetProgress.map((item) => (
                    <div key={item.id} className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold">{item.category}</h3>
                                <p className="text-xs text-muted-foreground capitalize">{item.period}ly Limit</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => removeBudget(item.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {/* Overall Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className={cn("font-medium", item.isOverBudget ? "text-destructive" : "text-muted-foreground")}>
                                        {formatter.format(item.spent)}
                                        {item.isOverBudget && <AlertCircle className="inline w-4 h-4 ml-1" />}
                                    </span>
                                    <span className="text-muted-foreground">{t.budgets.remaining} {formatter.format(item.amount)}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-500",
                                            item.isOverBudget ? "bg-destructive" :
                                                item.percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                                        )}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sub Items List */}
                            {item.subItems && item.subItems.length > 0 && (
                                <div className="space-y-2 mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">{t.budgets.breakdown}</p>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            (item.subItems?.reduce((s, i) => s + i.amount, 0) || 0) > item.amount
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        )}>
                                            {t.budgets.allocated}: {formatter.format(item.subItems?.reduce((s, i) => s + i.amount, 0) || 0)}
                                            {(item.subItems?.reduce((s, i) => s + i.amount, 0) || 0) > item.amount && (
                                                <AlertCircle className="inline h-3 w-3 ml-1" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {item.subItems.map(sub => (
                                            <div key={sub.id} className="group flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{sub.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{formatter.format(sub.amount)}</span>
                                                    <button
                                                        onClick={() => onRemoveSubItem(item, sub.id)}
                                                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Item Button */}
                        <div className="mt-6 pt-4 border-t">
                            <button
                                onClick={() => setSubItemFormTarget(item)}
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-secondary/80 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                                {t.budgets.addItem}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && <BudgetForm onClose={handleClose} initialData={editingBudget} year={selectedYear} />}
            {subItemFormTarget && (
                <BudgetSubItemForm
                    budget={subItemFormTarget}
                    onClose={() => setSubItemFormTarget(undefined)}
                />
            )}
        </div>
    );

}
