import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function CategoryBreakdown() {
    const { transactions, settings } = useStore();

    const data = useMemo(() => {
        const activeProfile = settings.activeProfile;
        const expenses = transactions.filter(
            t => t.type === 'expense' && t.profile === activeProfile
        );

        const grouped = expenses.reduce((acc, curr) => {
            if (!acc[curr.category]) {
                acc[curr.category] = 0;
            }
            acc[curr.category] += curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 categories
    }, [transactions, settings.activeProfile]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Spending by Category</h3>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <p>No expense data yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Spending by Category</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatter.format(value) : ''} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                    {data.map((item, index) => {
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{percentage}%</span>
                                    <span className="font-semibold">{formatter.format(item.value)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
