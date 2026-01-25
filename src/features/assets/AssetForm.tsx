import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import type { Asset, AssetType } from '../../types';
import { X } from 'lucide-react';

interface AssetFormProps {
    onClose: () => void;
    initialData?: Asset;
    suggestedType?: AssetType;
    group: 'equity' | 'liabilities';
    mode?: 'simple' | 'default';
    fixedType?: AssetType;
}

export function AssetForm({ onClose, initialData, suggestedType, group, mode = 'default', fixedType }: AssetFormProps) {
    const { addAsset, updateAsset, settings } = useStore();
    const [name, setName] = useState('');
    // Use fixedType if provided, otherwise fall back to suggested or default
    const [type, setType] = useState<AssetType>(
        fixedType || (initialData?.type) || suggestedType || (group === 'equity' ? 'Cash' : 'payable')
    );
    const [value, setValue] = useState('');
    const [quantity, setQuantity] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');

    // Determine if form should be simple based on the SELECTED type or forced mode
    const isSimpleForm = useMemo(() => {
        if (mode === 'simple') return true;

        const complexTypes = ['Stock', 'Bond', 'Fund certificate', 'Gold', 'Crypto', 'Business', 'investment'];
        return !complexTypes.includes(type);
    }, [type, mode]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setValue(initialData.value.toString());
            setQuantity(initialData.quantity?.toString() || '');
            setPricePerUnit(initialData.pricePerUnit?.toString() || '');
        } else if (fixedType) {
            setType(fixedType);
        } else if (suggestedType) {
            setType(suggestedType);
        }
    }, [initialData, suggestedType, fixedType]);

    // Auto-calculate total value when quantity or pricePerUnit changes
    useEffect(() => {
        if (!isSimpleForm && quantity && pricePerUnit) {
            const total = parseFloat(quantity) * parseFloat(pricePerUnit);
            if (!isNaN(total)) {
                setValue(total.toFixed(2));
            }
        }
    }, [quantity, pricePerUnit, isSimpleForm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !value) return;

        const assetData: Asset = {
            id: initialData ? initialData.id : crypto.randomUUID(),
            name,
            type,
            value: parseFloat(value),
            quantity: quantity ? parseFloat(quantity) : undefined,
            pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
            spaceId: initialData ? initialData.spaceId : settings.activeSpace,
            // Bucket logic can be inferred or simplified. For now mapping to simple buckets.
            bucket: ['payable', 'loan', 'credit'].includes(type) ? 'payable' : (['Stock', 'Bond', 'Crypto', 'Gold', 'investment'].includes(type) ? 'investment' : 'cash'),
            lastUpdated: new Date().toISOString()
        };

        if (initialData) {
            updateAsset(assetData);
        } else {
            addAsset(assetData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg sm:w-[450px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{initialData ? 'Edit Asset' : `Add ${fixedType || (group === 'equity' ? 'Asset' : 'Liability')}`}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{isSimpleForm ? 'Source Name' : 'Asset Symbol/Name'}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder={isSimpleForm ? "e.g., Bank Name" : "e.g., AAPL"}
                            required
                        />
                    </div>

                    {!fixedType && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as AssetType)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {group === 'equity' ? (
                                    <>
                                        <optgroup label="Cash & Equivalents">
                                            <option value="Cash">Cash</option>
                                            <option value="Bank Deposit">Bank Deposit</option>
                                            <option value="saving">Saving</option>
                                        </optgroup>
                                        <optgroup label="Investments">
                                            <option value="Stock">Stock</option>
                                            <option value="Bond">Bond</option>
                                            <option value="Fund certificate">Fund certificate</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Crypto">Crypto</option>
                                        </optgroup>
                                        <optgroup label="Receivables">
                                            <option value="receivable">Receivable</option>
                                        </optgroup>
                                    </>
                                ) : (
                                    <optgroup label="Liabilities">
                                        <option value="payable">Payable</option>
                                        <option value="loan">Loan</option>
                                        <option value="credit">Credit Card</option>
                                    </optgroup>
                                )}
                            </select>
                        </div>
                    )}



                    {!isSimpleForm && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="0"
                                    step="any"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Avg Price per Unit</label>
                                <input
                                    type="number"
                                    value={pricePerUnit}
                                    onChange={(e) => setPricePerUnit(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="0"
                                    step="any"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{!isSimpleForm ? 'Total Value (Calculated)' : 'Value'}</label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                            placeholder="0"
                            step="0.01"
                            required
                        />
                    </div>



                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {initialData ? 'Update Asset' : `Add ${fixedType || (group === 'equity' ? 'Asset' : 'Liability')}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
