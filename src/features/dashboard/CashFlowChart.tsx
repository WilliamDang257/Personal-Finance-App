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

        // Initialize map with 0s
        const stats = months.reduce((acc, month) => {
            acc[month] = { name: month, income: 0, expense: 0 };
            return acc;
        }, {} as Record<string, { name: string; income: number; expense: number }>);

        // Aggregate transactions
        const activeProfile = settings.activeProfile;
        transactions.forEach(t => {
            if (t.profile !== activeProfile) return;

            const date = new Date(t.date);
            if (date < startDate) return; // Ignore old data

            const monthName = date.toLocaleString('default', { month: 'short' });
            if (stats[monthName]) {
                if (t.type === 'income') {
                    stats[monthName].income += t.amount;
                } else {
                    stats[monthName].expense += t.amount;
                }
            }
        });

        return Object.values(stats);
    }, [transactions, settings.activeProfile]);

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
