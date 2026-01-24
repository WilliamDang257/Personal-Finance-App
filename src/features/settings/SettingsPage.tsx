import { generateDemoData } from '../../data/demoData';
import { useStore } from '../../hooks/useStore';
import { Save, Download, Upload, Moon, Sun, Trash2, FileSpreadsheet, Plus, Database } from 'lucide-react';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export function SettingsPage() {
    const { settings, updateSettings, transactions, assets, budgets, addTransaction, addAsset, addBudget, loadDemoData } = useStore();
    const [importStatus, setImportStatus] = useState<string>('');
    const [excelImportStatus, setExcelImportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ currency: e.target.value });
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updateSettings({ theme });
    };

    const handleExport = () => {
        const data = {
            transactions,
            assets,
            budgets,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExcelExport = () => {
        const workbook = XLSX.utils.book_new();

        // 1. Transactions Sheet
        const transactionsData = transactions.map(t => ({
            Date: t.date,
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Description: t.description,
            Profile: t.profile
        }));
        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');

        // 2. Assets Sheet
        const assetsData = assets.map(a => ({
            Name: a.name,
            Type: a.type,
            Value: a.value,
            Quantity: a.quantity || '',
            'Price Per Unit': a.pricePerUnit || '',
            Bucket: a.bucket,
            Profile: a.profile,
            'Last Updated': a.lastUpdated
        }));
        const assetsSheet = XLSX.utils.json_to_sheet(assetsData);
        XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Assets');

        // 3. Budgets Sheet
        const budgetsData = budgets.map(b => ({
            Category: b.category,
            Amount: b.amount,
            Period: b.period,
            Profile: b.profile
        }));
        const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
        XLSX.utils.book_append_sheet(workbook, budgetsSheet, 'Budgets');

        // Write file
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `finance_backup_personal_family_${dateStr}.xlsx`);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.version !== '1.0') {
                    setImportStatus('Warning: Unknown version');
                }

                if (Array.isArray(json.transactions)) {
                    json.transactions.forEach((t: any) => addTransaction(t));
                }
                if (Array.isArray(json.assets)) {
                    json.assets.forEach((a: any) => addAsset(a));
                }
                if (Array.isArray(json.budgets)) {
                    json.budgets.forEach((b: any) => addBudget(b));
                }
                if (json.settings) {
                    updateSettings(json.settings);
                }

                setImportStatus('Import successful!');
                setTimeout(() => setImportStatus(''), 3000);
            } catch (err) {
                console.error(err);
                setImportStatus('Error parsing file.');
            }
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                let importedCount = { transactions: 0, assets: 0 };

                // Process Income sheet
                if (workbook.SheetNames.includes('Income')) {
                    const incomeSheet = workbook.Sheets['Income'];
                    const incomeData = XLSX.utils.sheet_to_json(incomeSheet);

                    incomeData.forEach((row: any) => {
                        if (row['Date'] && row['Amount']) {
                            addTransaction({
                                id: crypto.randomUUID(),
                                date: excelDateToISOString(row['Date']),
                                amount: parseFloat(row['Amount']) || 0,
                                category: row['Category'] || 'Income',
                                description: row['Description'] || row['Note'] || '',
                                type: 'income',
                                profile: 'personal'
                            });
                            importedCount.transactions++;
                        }
                    });
                }

                // Process Expense sheet
                if (workbook.SheetNames.includes('Expense')) {
                    const expenseSheet = workbook.Sheets['Expense'];
                    const expenseData = XLSX.utils.sheet_to_json(expenseSheet);

                    expenseData.forEach((row: any) => {
                        if (row['Date'] && row['Amount']) {
                            addTransaction({
                                id: crypto.randomUUID(),
                                date: excelDateToISOString(row['Date']),
                                amount: parseFloat(row['Amount']) || 0,
                                category: row['Category'] || 'Expense',
                                description: row['Description'] || row['Note'] || '',
                                type: 'expense',
                                profile: 'personal'
                            });
                            importedCount.transactions++;
                        }
                    });
                }

                // Process Asset sheet
                if (workbook.SheetNames.includes('Asset')) {
                    const assetSheet = workbook.Sheets['Asset'];
                    const assetData = XLSX.utils.sheet_to_json(assetSheet);

                    assetData.forEach((row: any) => {
                        if (row['Name'] && row['Value']) {
                            const type = mapAssetType(row['Type']);
                            addAsset({
                                id: crypto.randomUUID(),
                                name: row['Name'],
                                type: type,
                                value: parseFloat(row['Value']) || 0,
                                quantity: row['Quantity'] ? parseFloat(row['Quantity']) : undefined,
                                pricePerUnit: row['Price Per Unit'] ? parseFloat(row['Price Per Unit']) : undefined,
                                profile: 'personal',
                                lastUpdated: new Date().toISOString(),
                                bucket: mapAssetBucket(type)
                            });
                            importedCount.assets++;
                        }
                    });
                }

                setExcelImportStatus(`Imported ${importedCount.transactions} transactions, ${importedCount.assets} assets`);
                setTimeout(() => setExcelImportStatus(''), 5000);
            } catch (err) {
                console.error(err);
                setExcelImportStatus('Error parsing Excel file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const excelDateToISOString = (excelDate: any): string => {
        if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }
        if (excelDate instanceof Date) {
            return excelDate.toISOString().split('T')[0];
        }
        const parsed = new Date(excelDate);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    };

    const mapAssetType = (type: any): any => {
        if (!type) return 'other';
        const typeStr = type.toString().toLowerCase();

        const mapping: Record<string, string> = {
            'cash': 'cash',
            'saving': 'saving',
            'stock': 'stock',
            'bond': 'bond',
            'gold': 'gold',
            'crypto': 'crypto',
            'property': 'property',
            'real estate': 'property'
        };

        return mapping[typeStr] || 'other';
    };

    const mapAssetBucket = (type: string): 'cash' | 'investment' | 'receivable' | 'payable' => {
        if (['cash', 'saving'].includes(type)) return 'cash';
        if (['stock', 'bond', 'gold', 'crypto', 'property', 'real_estate'].includes(type)) return 'investment';
        if (type === 'receivable') return 'receivable';
        if (type === 'payable') return 'payable';
        return 'cash'; // Default
    };

    const triggerExcelImport = () => {
        excelInputRef.current?.click();
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-2">Manage your preferences and data.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            General Configuration
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Currency</label>
                                <select
                                    value={settings.currency}
                                    onChange={handleCurrencyChange}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="VND">VND (₫)</option>
                                    <option value="CNY">CNY (¥)</option>
                                </select>
                                <p className="text-xs text-muted-foreground">Select your primary currency for display.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Theme</label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg inline-flex">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-2 rounded-md transition-all ${settings.theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="Light Mode"
                                    >
                                        <Sun className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('system')}
                                        className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${settings.theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="System Default"
                                    >
                                        System
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-2 rounded-md transition-all ${settings.theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="Dark Mode"
                                    >
                                        <Moon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Budget Rules
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Enforce Unique Categories</label>
                                <p className="text-xs text-muted-foreground">Prevent creating multiple budgets for the same category within a profile.</p>
                            </div>
                            <button
                                role="switch"
                                aria-checked={settings.budgetRules?.enforceUniqueCategory ?? true}
                                onClick={() => updateSettings({
                                    budgetRules: {
                                        ...settings.budgetRules,
                                        enforceUniqueCategory: !(settings.budgetRules?.enforceUniqueCategory ?? true)
                                    }
                                })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${(settings.budgetRules?.enforceUniqueCategory ?? true) ? 'bg-primary' : 'bg-input/20 border-2 border-input'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform shadow-sm ${(settings.budgetRules?.enforceUniqueCategory ?? true) ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CategoryManagement settings={settings} updateSettings={updateSettings} />

            <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Demo Mode
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                Populate the application with sample data (Transactions, Assets, Budgets) to explore the features.
                                <br />
                                <span className="font-bold text-destructive">Warning: This will overwrite your current data!</span>
                            </p>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure? This will replace all your current data with demo data.')) {
                                        loadDemoData(generateDemoData());
                                        alert('Demo data loaded!');
                                    }
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors w-fit"
                            >
                                <Database className="h-4 w-4" />
                                Load Demo Data
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Data Management
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <Download className="h-4 w-4" />
                                Export Data (JSON)
                            </button>
                            <p className="text-xs text-muted-foreground">Download a backup of all your transactions, assets, and settings.</p>
                        </div>

                        <div className="flex flex-col gap-2 border-t pt-4">
                            <button
                                onClick={handleExcelExport}
                                className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export to Excel
                            </button>
                            <p className="text-xs text-muted-foreground">Export data to Excel for external analysis (Personal & Family).</p>
                        </div>

                        <div className="flex flex-col gap-2 border-t pt-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                            <button
                                onClick={triggerImport}
                                className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <Upload className="h-4 w-4" />
                                Import Data (JSON)
                            </button>
                            {importStatus && <p className="text-xs font-medium text-green-600 text-center">{importStatus}</p>}
                            <p className="text-xs text-muted-foreground">Restore from a backup file.</p>
                        </div>

                        <div className="flex flex-col gap-2 border-t pt-4">
                            <input
                                type="file"
                                ref={excelInputRef}
                                onChange={handleExcelImport}
                                accept=".xlsx,.xls"
                                className="hidden"
                            />
                            <button
                                onClick={triggerExcelImport}
                                className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Import from Excel
                            </button>
                            {excelImportStatus && <p className="text-xs font-medium text-green-600 text-center">{excelImportStatus}</p>}
                            <p className="text-xs text-muted-foreground">Import transactions and assets from your Excel file (Income, Expense, Asset sheets).</p>
                        </div>

                        <div className="border-t pt-4">
                            <button
                                className="flex items-center justify-center gap-2 w-full rounded-md border border-destructive/50 text-destructive bg-background px-4 py-2 text-sm font-medium hover:bg-destructive/10"
                                onClick={() => {
                                    if (confirm('Are you sure? This will reset your local data completely.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Reset All Data
                            </button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">Caution: This action cannot be undone.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryManagement({ settings, updateSettings }: { settings: any, updateSettings: any }) {
    const [newExpense, setNewExpense] = useState('');
    const [newIncome, setNewIncome] = useState('');

    const addCategory = (type: 'expense' | 'income', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        const currentList = settings.categories?.[type] || [];
        if (currentList.includes(value.trim())) return;

        updateSettings({
            categories: {
                ...settings.categories,
                [type]: [...currentList, value.trim()]
            }
        });
        setter('');
    };

    const removeCategory = (type: 'expense' | 'income', value: string) => {
        const currentList = settings.categories?.[type] || [];
        updateSettings({
            categories: {
                ...settings.categories,
                [type]: currentList.filter((c: string) => c !== value)
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Category Management
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Expense Categories */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Expense Categories</label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {(settings.categories?.expense || []).map((cat: string) => (
                                <div key={cat} className="flex items-center justify-between p-2 rounded-md bg-muted/50 group">
                                    <span className="text-sm">{cat}</span>
                                    <button
                                        onClick={() => removeCategory('expense', cat)}
                                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New expense category..."
                                value={newExpense}
                                onChange={(e) => setNewExpense(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCategory('expense', newExpense, setNewExpense)}
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                onClick={() => addCategory('expense', newExpense, setNewExpense)}
                                className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Income Categories */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Income Categories</label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {(settings.categories?.income || []).map((cat: string) => (
                                <div key={cat} className="flex items-center justify-between p-2 rounded-md bg-muted/50 group">
                                    <span className="text-sm">{cat}</span>
                                    <button
                                        onClick={() => removeCategory('income', cat)}
                                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New income category..."
                                value={newIncome}
                                onChange={(e) => setNewIncome(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCategory('income', newIncome, setNewIncome)}
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                onClick={() => addCategory('income', newIncome, setNewIncome)}
                                className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
