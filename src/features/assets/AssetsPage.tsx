import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { AssetForm } from './AssetForm';

import { Plus, Trash2, Wallet, TrendingUp, Pencil, Landmark, Briefcase, MinusCircle, PlusCircle, Building2, Coins, CreditCard, ExternalLink } from 'lucide-react';
import type { Asset, AssetType } from '../../types';

type AssetGroup = 'equity' | 'liabilities';

interface AssetsPageProps {
    mode?: 'equity' | 'liability';
}

export function AssetsPage({ mode = 'equity' }: AssetsPageProps) {
    const { assets, removeAsset, settings } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);

    // Derived from mode
    const activeGroup: AssetGroup = mode === 'liability' ? 'liabilities' : 'equity';

    // New state for form props
    const [formMode, setFormMode] = useState<'simple' | 'default'>('default');
    const [formFixedType, setFormFixedType] = useState<AssetType | undefined>(undefined);


    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'Stock': return TrendingUp;
            case 'Bond': return Building2;
            case 'Crypto': return Coins;
            case 'Gold': return Coins;
            case 'Business': return Briefcase;
            case 'investment': return TrendingUp;
            case 'Bank Deposit':
            case 'saving': return Landmark;
            case 'Cash':
            case 'cash': return Wallet;
            case 'receivable': return PlusCircle;
            case 'payable':
            case 'loan': return MinusCircle;
            case 'credit': return CreditCard;
            default: return Briefcase;
        }
    };

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingAsset(undefined);
    };

    const activeSpace = settings.activeSpace;
    const profileAssets = assets.filter(a => a.spaceId === activeSpace);

    // Classification Logic
    const classifyAsset = (asset: Asset) => {
        const t = asset.type;
        // Liabilities
        if (['payable', 'loan', 'credit'].includes(t) || asset.bucket === 'payable') return 'liabilities';

        // Equity Subgroups
        if (['Cash', 'Bank Deposit', 'saving', 'cash'].includes(t)) return 'cash';
        if (['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto', 'Business', 'investment'].includes(t)) return 'investment';
        if (['receivable'].includes(t)) return 'receivable';

        return 'other'; // Fallback
    };

    const sections = useMemo(() => {
        const cash = profileAssets.filter(a => classifyAsset(a) === 'cash');
        const investment = profileAssets.filter(a => classifyAsset(a) === 'investment');
        const receivable = profileAssets.filter(a => classifyAsset(a) === 'receivable');
        const liabilities = profileAssets.filter(a => classifyAsset(a) === 'liabilities');

        return { cash, investment, receivable, liabilities };
    }, [profileAssets]);

    const stats = useMemo(() => {
        const totalCash = sections.cash.reduce((acc, c) => acc + c.value, 0);
        const totalInvestment = sections.investment.reduce((acc, c) => acc + c.value, 0);
        const totalReceivable = sections.receivable.reduce((acc, c) => acc + c.value, 0);
        const totalLiabilities = sections.liabilities.reduce((acc, c) => acc + c.value, 0);

        const totalEquity = totalCash + totalInvestment + totalReceivable;

        return { totalEquity, totalLiabilities, netWorth: totalEquity - totalLiabilities, totalCash, totalInvestment, totalReceivable };
    }, [sections]);

    // Handlers for Add Buttons
    const handleAddCash = () => {
        setFormMode('simple');
        setFormFixedType('Cash');
        setIsFormOpen(true);
    };

    const handleAddInvestment = () => {
        setFormMode('default');
        setFormFixedType('Stock');
        setIsFormOpen(true);
    };

    const handleAddReceivable = () => {
        setFormMode('simple');
        setFormFixedType('receivable');
        setIsFormOpen(true);
    };

    const handleAddLiability = () => {
        setFormMode('default');
        setFormFixedType('payable');
        setIsFormOpen(true);
    };

    const renderAssetList = (title: string, items: Asset[], total: number, onAdd?: () => void) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{title}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{items.length}</span>
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Add Item"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="divide-y border rounded-xl bg-card overflow-hidden">
                {items.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground bg-muted/5">
                        No items in this section.
                    </div>
                )}
                {items.map((asset) => {
                    const Icon = getIcon(asset.type);
                    return (
                        <div
                            key={asset.id}
                            className="group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-secondary/50 p-2.5 text-foreground ring-1 ring-border">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">{asset.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span className="capitalize">{asset.type.replace('_', ' ')}</span>
                                        {asset.quantity && asset.pricePerUnit && (
                                            <>
                                                <span>•</span>
                                                <span>{asset.quantity} x {formatter.format(asset.pricePerUnit)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-right">
                                <div>
                                    <div className={`font-mono font-medium ${classifyAsset(asset) === 'liabilities' ? 'text-red-600' : 'text-foreground'}`}>
                                        {formatter.format(asset.value)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-all"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => removeAsset(asset.id)}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-background border border-transparent hover:border-border transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {items.length > 0 && (
                <div className="flex justify-end px-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total: <span className="text-foreground ml-1">{formatter.format(total)}</span>
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {mode === 'equity' ? 'Equity Assets' : 'Liabilities'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {mode === 'equity'
                                ? 'Track your cash, investments, and receivables.'
                                : 'Manage your debts, loans, and other obligations.'}
                        </p>
                    </div>
                    {/* External Link */}
                    <div>
                        <a
                            href="https://banggia.dnse.com.vn/vn30"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border bg-background hover:bg-muted text-foreground transition-all"
                            title="Open DNSE Price Board"
                        >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <span className="hidden sm:inline">VN30 Board</span>
                        </a>
                    </div>
                </div>


                {/* Hero Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Net Worth</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {formatter.format(stats.netWorth)}
                        </div>
                    </div>

                    {activeGroup === 'equity' ? (
                        <>
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Total Assets</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {formatter.format(stats.totalEquity)}
                                </div>
                            </div>
                            <div className="rounded-xl border bg-card/50 p-5 border-dashed flex flex-col justify-center">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-muted-foreground">Cash</span>
                                    <span className="font-medium">{formatter.format(stats.totalCash)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Invested</span>
                                    <span className="font-medium">{formatter.format(stats.totalInvestment)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <MinusCircle className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Total Liabilities</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                                {formatter.format(stats.totalLiabilities)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-10">
                {activeGroup === 'equity' ? (
                    <>
                        {renderAssetList('Cash & Equivalents', sections.cash, stats.totalCash, handleAddCash)}
                        {renderAssetList('Investments', sections.investment, stats.totalInvestment, handleAddInvestment)}
                        {renderAssetList('Receivables', sections.receivable, stats.totalReceivable, handleAddReceivable)}
                    </>
                ) : (
                    renderAssetList('Debts & Payables', sections.liabilities, stats.totalLiabilities, handleAddLiability)
                )}
            </div>


            {
                isFormOpen && (
                    <AssetForm
                        onClose={handleClose}
                        initialData={editingAsset}
                        group={activeGroup}
                        mode={formMode}
                        fixedType={formFixedType}
                    />
                )
            }
        </div >
    );
}
