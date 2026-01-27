import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { AssetAllocationChart } from '../assets/AssetAllocationChart';
import { TrendingUp, Building2, Coins, Briefcase, ExternalLink, Plus, History, ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from 'lucide-react';
import { AssetForm } from '../assets/AssetForm';
import type { Asset } from '../../types';

export function InvestmentsPage() {
    const { t } = useTranslation();
    const { assets, settings, investmentLogs, addInvestmentLog, removeInvestmentLog, removeAsset } = useStore();
    const activeSpace = settings.activeSpace;
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);

    // Form state for adding logs
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const formatter = new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'en-US'), {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0
    });

    const investmentAssets = useMemo(() => {
        return assets.filter(a => a.spaceId === activeSpace && (
            ['Stock', 'Bond', 'Fund certificate', 'Crypto', 'Gold', 'investment'].includes(a.type) ||
            a.bucket === 'investment'
        ));
    }, [assets, activeSpace]);

    const currentPortfolioValue = useMemo(() => {
        return investmentAssets.reduce((acc, asset) => acc + asset.value, 0);
    }, [investmentAssets]);

    const netInvestedCapital = useMemo(() => {
        // Simple logic: sum of all investment logs (positive = deposit, negative = withdrawal)
        // This is an approximation. A real system would track per-asset cost basis.
        return investmentLogs.filter(l => l.spaceId === activeSpace).reduce((acc, log) => acc + log.amount, 0);
    }, [investmentLogs, activeSpace]);

    const profit = currentPortfolioValue - netInvestedCapital;
    const growthRate = netInvestedCapital !== 0 ? (profit / netInvestedCapital) * 100 : 0;

    const handleAddAsset = () => {
        setEditingAsset(undefined);
        setIsAssetFormOpen(true);
    };

    const handleEditAsset = (asset: Asset) => {
        setEditingAsset(asset);
        setIsAssetFormOpen(true);
    };

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !date) return;

        addInvestmentLog({
            date,
            amount: parseFloat(amount),
            note: note || t.investments.investmentDeposit,
            spaceId: activeSpace
        });

        // Reset form
        setAmount('');
        setNote('');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Stock': return TrendingUp;
            case 'Bond': return Building2;
            case 'Crypto': return Coins;
            case 'Gold': return Coins;
            case 'Business': return Briefcase;
            default: return TrendingUp;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.investments.title}</h2>
                    <p className="text-muted-foreground mt-2">{t.investments.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <a
                        href="https://banggia.dnse.com.vn/vn30"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-muted text-foreground transition-all"
                    >
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="hidden sm:inline">{t.investments.marketData}</span>
                    </a>
                    <button
                        onClick={handleAddAsset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{t.assets.addAsset}</span>
                    </button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.investments.totalValue}</p>
                    <h3 className="text-2xl font-bold mt-2">{formatter.format(currentPortfolioValue)}</h3>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.investments.netInvested}</p>
                    <h3 className="text-2xl font-bold mt-2 text-blue-600">{formatter.format(netInvestedCapital)}</h3>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.investments.profitLoss}</p>
                    <div className={`flex items-center gap-2 mt-2 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <h3 className="text-2xl font-bold">{formatter.format(profit)}</h3>
                        {profit >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.investments.growthRate}</p>
                    <div className={`flex items-center gap-2 mt-2 ${growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <h3 className="text-2xl font-bold">{growthRate.toFixed(2)}%</h3>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Allocation Chart (2/3 width) */}
                <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">{t.investments.allocation}</h3>
                    <div className="h-[350px]">
                        <AssetAllocationChart mode="details" activeTab="investment" />
                    </div>
                </div>

                {/* Investment History (1/3 width) */}
                <div className="rounded-xl border bg-card shadow-sm flex flex-col h-[450px]">
                    <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">{t.investments.capitalHistory}</h3>
                        </div>
                    </div>

                    {/* Add Log Form */}
                    <div className="p-4 border-b bg-muted/10">
                        <form onSubmit={handleAddLog} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="text-xs rounded-md border px-2 py-1.5 bg-background"
                                    required
                                />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder={`${t.transactions.amount} (+/-)`}
                                    className="text-xs rounded-md border px-2 py-1.5 bg-background"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder={`${t.transactions.description}...`}
                                    className="flex-1 text-xs rounded-md border px-2 py-1.5 bg-background"
                                />
                                <button type="submit" className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                                    {t.transactions.actions}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* History List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {investmentLogs.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-8">{t.investments.noHistory}</p>
                        ) : (
                            investmentLogs
                                .filter(l => l.spaceId === activeSpace)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-2.5 rounded-md border bg-card hover:bg-muted/50 transition-colors text-sm">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-xs">{log.note || 'Transaction'}</span>
                                            <span className="text-[10px] text-muted-foreground">{log.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-medium ${log.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {log.amount >= 0 ? '+' : ''}{formatter.format(log.amount)}
                                            </span>
                                            <button onClick={() => removeInvestmentLog(log.id)} className="text-muted-foreground hover:text-destructive">
                                                <span className="sr-only">Delete</span>
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>

            {/* Holdings List */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{t.investments.currentHoldings}</h3>
                    <span className="text-xs text-muted-foreground">{investmentAssets.length} assets</span>
                </div>
                <div className="divide-y">
                    {investmentAssets.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {t.investments.noAssets}
                        </div>
                    ) : (
                        investmentAssets.map(asset => {
                            const Icon = getIcon(asset.type);
                            return (
                                <div key={asset.id} className="group p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleEditAsset(asset)}>
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2.5 text-blue-600 dark:text-blue-400">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{asset.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="capitalize">{asset.type}</span>
                                                {asset.quantity && asset.pricePerUnit && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{asset.quantity} units @ {formatter.format(asset.pricePerUnit)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold text-foreground">
                                                {formatter.format(asset.value)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {((asset.value / currentPortfolioValue) * 100).toFixed(1)}% of portfolio
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditAsset(asset)}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-all"
                                                title="Edit Asset"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => removeAsset(asset.id)}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-background border border-transparent hover:border-border transition-all"
                                                title="Delete Asset"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {isAssetFormOpen && (
                <AssetForm
                    onClose={() => setIsAssetFormOpen(false)}
                    initialData={editingAsset}
                    group="equity" // Investments count as equity
                    mode="default"
                    suggestedType="Stock"
                />
            )}
        </div>
    );
}
