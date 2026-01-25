import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';

export function CashFlowChart() {
    const { transactions, settings } = useStore();

    const data = useMemo(() => {
        const startDate = new Date('2026-01-01T00:00:00');
        const endDate = new Date(); // Today
        const months = [];

        let d = new Date(startDate);
        while (d <= endDate || d.getMonth() === endDate.getMonth()) {
            months.push(d.toLocaleString('default', { month: 'short' }));
            d.setMonth(d.getMonth() + 1);
        }

        const activeSpace = settings.activeSpace;
        const result: Record<string, { income: number; expense: number }> = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short' });
            result[key] = { income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            if (t.spaceId !== activeSpace) return;

            const d = new Date(t.date);
            // Check if within last 6 months (approx)
            const now = new Date();
            const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());

            if (diffMonths >= 0 && diffMonths <= 5) {
                const key = d.toLocaleString('default', { month: 'short' });
                if (result[key]) {
                    if (t.type === 'income') result[key].income += t.amount;
                    else result[key].expense += t.amount;
                }
            }
        });

        return Object.entries(result).map(([name, { income, expense }]) => ({
            name,
            Income: income,
            Expense: expense
        }));
    }, [transactions, settings.activeSpace]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="h-full w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        formatter={(value: number | undefined) => value !== undefined ? formatter.format(value) : ''}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
