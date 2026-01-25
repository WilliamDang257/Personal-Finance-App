import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { BudgetForm } from './BudgetForm';
import { BudgetSubItemForm } from './BudgetSubItemForm';
import { BudgetDistributionChart } from './BudgetDistributionChart';
import { Plus, Trash2, Pencil, AlertCircle } from 'lucide-react';
import type { Budget } from '../../types';
import { cn } from '../../lib/utils';

export function BudgetsPage() {
    const { budgets, transactions, removeBudget, settings } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [subItemFormTarget, setSubItemFormTarget] = useState<Budget | undefined>(undefined);
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    const budgetProgress = useMemo(() => {
        const activeSpace = settings.activeSpace;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return budgets
            .filter(b => b.spaceId === activeSpace)
            .map(budget => {
                const spent = transactions
                    .filter(t =>
                        t.category.toLowerCase() === budget.category.toLowerCase() &&
                        t.type === 'expense' &&
                        t.spaceId === activeSpace &&
                        (budget.period === 'year'
                            ? (new Date(t.date).getFullYear() === currentYear)
                            : (new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
                        )
                    )
                    .reduce((acc, t) => acc + t.amount, 0);

                const percentage = Math.min((spent / budget.amount) * 100, 100);
                const isOverBudget = spent > budget.amount;

                return {
                    ...budget,
                    spent,
                    percentage,
                    isOverBudget
                };
            });
    }, [budgets, transactions, settings.activeSpace]);

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingBudget(undefined);
    };

    const totalBudget = useMemo(() => {
        return budgetProgress.reduce((acc, curr) => acc + curr.amount, 0);
    }, [budgetProgress]);

    const onRemoveSubItem = (budget: Budget, subItemId: string) => {
        const updatedSubItems = (budget.subItems || []).filter(i => i.id !== subItemId);

        const { updateBudget } = useStore.getState();
        updateBudget({
            ...budget,
            subItems: updatedSubItems,
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* ... Header ... */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
                    <p className="text-muted-foreground mt-2">
                        Total Yearly Budget: <span className="font-semibold text-primary">{formatter.format(totalBudget)}</span>
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <BudgetDistributionChart />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {budgetProgress.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground p-6 border rounded-xl bg-card col-span-full">
                        <p>No budgets set yet. Create one to track your spending!</p>
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
                                    <span className="text-muted-foreground">of {formatter.format(item.amount)}</span>
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
                            {/* Sub Items List */}
                            {item.subItems && item.subItems.length > 0 && (
                                <div className="space-y-2 mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Breakdown</p>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            (item.subItems?.reduce((s, i) => s + i.amount, 0) || 0) > item.amount
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        )}>
                                            Allocated: {formatter.format(item.subItems?.reduce((s, i) => s + i.amount, 0) || 0)}
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
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
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
                                Add Item
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && <BudgetForm onClose={handleClose} initialData={editingBudget} />}
            {subItemFormTarget && (
                <BudgetSubItemForm
                    budget={subItemFormTarget}
                    onClose={() => setSubItemFormTarget(undefined)}
                />
            )}
        </div>
    );

}
