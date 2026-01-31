
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1', '#ef4444', '#14b8a6', '#f97316'];

interface BudgetDistributionChartProps {
    year: number;
}

export function BudgetDistributionChart({ year }: BudgetDistributionChartProps) {
    const { budgets, settings } = useStore();

    const data = useMemo(() => {
        const activeSpace = settings.activeSpace;

        return budgets
            .filter(b => b.spaceId === activeSpace && b.amount > 0 && b.year === year)
            .map(b => ({
                name: b.category,
                value: b.amount,
                period: b.period
            }))
            .sort((a, b) => b.value - a.value);
    }, [budgets, settings.activeSpace, year]);

    const totalValue = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency || 'VND',
        maximumFractionDigits: 0,
    });

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground p-6 border rounded-xl bg-card">
                <p>No budgets details to display.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">Budget Allocation</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => {
                                if (value === undefined || value === null) return ['0', 'Budget'];
                                const numValue = Number(value);
                                const percent = ((numValue / totalValue) * 100).toFixed(1);
                                return [`${formatter.format(numValue)} (${percent}%)`, 'Budget'];
                            }}
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{ fontSize: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
