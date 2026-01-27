import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';

interface Props {
    selectedDate: Date;
    viewMode: 'month' | 'year';
}

export function CashFlowChart({ selectedDate, viewMode }: Props) {
    const { transactions, settings } = useStore();

    const data = useMemo(() => {
        const targetYear = selectedDate.getFullYear();
        const targetMonth = selectedDate.getMonth();
        const activeSpace = settings.activeSpace;
        const result: Record<string, { income: number; expense: number }> = {};

        if (viewMode === 'year') {
            // Initialize all 12 months for the selected year
            for (let i = 0; i < 12; i++) {
                const d = new Date(targetYear, i, 1);
                const key = d.toLocaleString('default', { month: 'short' });
                result[key] = { income: 0, expense: 0 };
            }

            transactions.forEach(t => {
                if (t.spaceId !== activeSpace) return;
                const d = new Date(t.date);
                if (d.getFullYear() === targetYear) {
                    const key = d.toLocaleString('default', { month: 'short' });
                    if (result[key]) {
                        if (t.type === 'income') result[key].income += t.amount;
                        else result[key].expense += t.amount;
                    }
                }
            });
        } else {
            // Month View: Show Days
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const key = i.toString();
                result[key] = { income: 0, expense: 0 };
            }

            transactions.forEach(t => {
                if (t.spaceId !== activeSpace) return;
                const d = new Date(t.date);
                if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
                    const key = d.getDate().toString();
                    if (result[key]) {
                        if (t.type === 'income') result[key].income += t.amount;
                        else result[key].expense += t.amount;
                    }
                }
            });
        }

        return Object.entries(result).map(([name, { income, expense }]) => ({
            name,
            Income: income,
            Expense: expense
        }));
    }, [transactions, settings.activeSpace, selectedDate, viewMode]);

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
