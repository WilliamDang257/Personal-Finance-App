import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1'];

interface AssetAllocationChartProps {
    mode?: 'summary' | 'details';
    activeTab?: string;
    includeLiabilities?: boolean;
}

export function AssetAllocationChart({ mode = 'summary', activeTab, includeLiabilities = false }: AssetAllocationChartProps) {
    const { assets, settings } = useStore();

    const data = useMemo(() => {
        const activeSpace = settings.activeSpace;
        const profileAssets = assets.filter(a => a.spaceId === activeSpace);

        // Helper to get bucket with fallback for legacy data
        const getAssetBucket = (asset: any): string => {
            if (asset.bucket) return asset.bucket;
            if (['Cash', 'Bank Deposit', 'cash', 'saving'].includes(asset.type)) return 'cash';
            if (['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto', 'Business', 'investment'].includes(asset.type)) return 'investment';
            if (asset.type === 'receivable') return 'receivable';
            if (asset.type === 'payable') return 'payable';
            return 'cash';
        };

        let grouped: Record<string, number> = {};

        if (mode === 'details' && activeTab) {
            // Breakdown within the specific bucket (e.g., Cash, Investment, etc.)
            grouped = profileAssets
                .filter(a => getAssetBucket(a) === activeTab)
                .reduce((acc, curr) => {
                    // Use name as label for cash/receivable/payable, type for others (investment)
                    const label = ['cash', 'receivable', 'payable'].includes(activeTab)
                        ? curr.name
                        : curr.type.charAt(0).toUpperCase() + curr.type.slice(1);
                    acc[label] = (acc[label] || 0) + curr.value;
                    return acc;
                }, {} as Record<string, number>);
        } else {
            // Summary breakdown (Cash, Investment, Receivable, optionally Payable)
            grouped = profileAssets
                .filter(a => includeLiabilities ? true : getAssetBucket(a) !== 'payable')
                .reduce((acc, curr) => {
                    let label = 'Other';
                    const bucket = getAssetBucket(curr);
                    if (bucket === 'cash') label = 'Cash';
                    else if (bucket === 'investment') label = 'Investments';
                    else if (bucket === 'receivable') label = 'Receivable';
                    else if (bucket === 'payable') label = 'Payable';

                    acc[label] = (acc[label] || 0) + curr.value;
                    return acc;
                }, {} as Record<string, number>);
        }

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [assets, settings.activeSpace, mode, activeTab, includeLiabilities]);

    const totalValue = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
    });

    if (assets.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No assets to display.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | undefined) => {
                            if (value === undefined) return '';
                            const percent = ((value / totalValue) * 100).toFixed(1);
                            return [`${formatter.format(value)} (${percent}%)`];
                        }}
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Legend
                        formatter={(value) => {
                            const item = data.find(d => d.name === value);
                            const percent = item ? ((item.value / totalValue) * 100).toFixed(1) : 0;
                            const amount = item ? formatter.format(item.value) : '';
                            return `${value} (${percent}%) - ${amount}`;
                        }}
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
