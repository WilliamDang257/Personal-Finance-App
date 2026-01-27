import { generateDemoData } from '../../data/demoData';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { hasEmbeddedKeys } from '../../config/aiConfig';
import type { AppSettings } from '../../types';
import { Save, Download, Upload, Moon, Sun, Trash2, FileSpreadsheet, Plus, Database, Heart, Settings, Tags, Sparkles, Target, Shield } from 'lucide-react';
import { useState, useRef } from 'react';

export function SettingsPage() {
    const { t } = useTranslation();
    const { settings, updateSettings, transactions, assets, budgets, addTransaction, addAsset, importData, addSpace, updateSpace, removeSpace } = useStore();
    const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'data' | 'ai'>('general');

    const tabs = [
        { id: 'general', label: t.settings.general, icon: Settings },
        { id: 'categories', label: t.settings.categoryManagement, icon: Tags },
        { id: 'data', label: t.settings.dataManagement, icon: Database },
        { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t.settings.title}</h2>
                <p className="text-muted-foreground mt-2">{t.settings.subtitle}</p>
            </div>

            <div className="flex space-x-1 rounded-xl bg-muted p-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'general' | 'categories' | 'data' | 'ai')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {activeTab === 'general' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <GeneralSettings settings={settings} updateSettings={updateSettings} t={t} />
                        <div className="space-y-6">
                            <BudgetRulesSettings settings={settings} updateSettings={updateSettings} t={t} />
                            <SecuritySettings settings={settings} updateSettings={updateSettings} t={t} />
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <CategoryManagement settings={settings} updateSettings={updateSettings} />
                )}

                {activeTab === 'data' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <SpaceManagement
                            settings={settings}
                            addSpace={addSpace}
                            updateSpace={updateSpace}
                            removeSpace={removeSpace}
                            activeSpaceId={settings.activeSpace}
                        />
                        <DataManagement
                            t={t}
                            settings={settings}
                            transactions={transactions}
                            assets={assets}
                            budgets={budgets}
                            importData={importData}
                            addTransaction={addTransaction}
                            addAsset={addAsset}
                        />
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="max-w-2xl">
                        <AISettings settings={settings} updateSettings={updateSettings} />
                    </div>
                )}
            </div>
        </div>
    );
}

interface SettingsProps {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
}

function GeneralSettings({ settings, updateSettings, t }: SettingsProps) {
    const handleThemeChange = (theme: 'light' | 'dark' | 'system' | 'pink' | 'red') => {
        updateSettings({ theme });
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t.settings.general}
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">App Name</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={settings.appName || ''}
                            onChange={(e) => updateSettings({ appName: e.target.value })}
                            placeholder="Personal Wealth"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                            onClick={() => updateSettings({ appName: 'Personal Wealth' })}
                            className="p-2 rounded-md border hover:bg-muted text-muted-foreground"
                            title="Reset to Default"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t.settings.currency}</label>
                    <select
                        value={settings.currency}
                        onChange={(e) => updateSettings({ currency: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="VND">VND (₫)</option>
                        <option value="CNY">CNY (¥)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t.settings.language}</label>
                    <select
                        value={settings.language || 'en'}
                        onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'vi' | 'ko' })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="en">English</option>
                        <option value="vi">Tiếng Việt</option>
                        <option value="ko">한국어</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block">{t.settings.theme}</label>
                    <div className="flex gap-2 p-1 bg-muted rounded-lg inline-flex flex-wrap">
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
                        <div className="w-[1px] h-4 bg-border mx-1 self-center" />
                        <button
                            onClick={() => handleThemeChange('pink')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${settings.theme === 'pink' ? 'bg-pink-100 text-pink-600 shadow-sm border border-pink-200' : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50'}`}
                            title="Girlfriend Mode"
                        >
                            <Heart className={`h-4 w-4 ${settings.theme === 'pink' ? 'fill-current' : ''}`} />
                            <span className="text-xs font-medium">Pink</span>
                        </button>
                        <button
                            onClick={() => handleThemeChange('red')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${settings.theme === 'red' ? 'bg-red-100 text-red-600 shadow-sm border border-red-200' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'}`}
                            title="Red Theme"
                        >
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="text-xs font-medium">Red</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BudgetRulesSettings({ settings, updateSettings, t }: SettingsProps) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t.settings.budgetRules}
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">{t.settings.enforceUnique}</label>
                        <p className="text-xs text-muted-foreground">{t.settings.enforceUniqueDesc}</p>
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
    );
}

interface AISettingsProps {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
}

function AISettings({ settings, updateSettings }: AISettingsProps) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Assistant
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">Enable AI Assistant</label>
                        <p className="text-xs text-muted-foreground">Turn on the AI-powered financial chatbot.</p>
                    </div>
                    <button
                        role="switch"
                        aria-checked={settings.chat?.enabled ?? false}
                        onClick={() => updateSettings({
                            chat: {
                                ...settings.chat,
                                enabled: !(settings.chat?.enabled ?? false),
                                provider: 'gemini',
                                enableProactive: settings.chat?.enableProactive ?? false
                            }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${(settings.chat?.enabled ?? false) ? 'bg-primary' : 'bg-input/20 border-2 border-input'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform shadow-sm ${(settings.chat?.enabled ?? false) ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Gemini API Key</label>
                    {hasEmbeddedKeys ? (
                        <div className="p-3 bg-muted rounded-md border border-input">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium">Managed by Application</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                API access is pre-configured. No action needed.
                            </p>
                        </div>
                    ) : (
                        <>
                            <input
                                type="password"
                                value={settings.chat?.apiKey || ''}
                                onChange={(e) => {
                                    let cleanKey = e.target.value.trim();
                                    const match = cleanKey.match(/AIza[0-9A-Za-z-_]{35}/);
                                    if (match) {
                                        cleanKey = match[0];
                                    }

                                    updateSettings({
                                        chat: {
                                            ...settings.chat,
                                            enabled: settings.chat?.enabled ?? false,
                                            provider: 'gemini',
                                            apiKey: cleanKey,
                                            enableProactive: settings.chat?.enableProactive ?? false
                                        }
                                    });
                                }}
                                placeholder="Enter your Gemini API key..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Get a free API key at:{' '}
                                <a
                                    href="https://makersuite.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Google AI Studio
                                </a>
                            </p>
                        </>
                    )}
                </div>

                <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Privacy Notice:</p>
                    <p>The AI assistant analyzes your financial data to provide insights. Your API key is stored locally and only minimal context is sent to Google's Gemini API.</p>
                </div>
            </div>
        </div>
    );
}

interface DataManagementProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
    settings: AppSettings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budgets: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importData: (data: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addTransaction: (t: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addAsset: (a: any) => void;
}

function DataManagement({ t, settings, transactions, assets, budgets, importData, addTransaction, addAsset }: DataManagementProps) {
    const [importStatus, setImportStatus] = useState<string>('');
    const [excelImportStatus, setExcelImportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            transactions,
            assets,
            budgets,
            settings,
            monthlySummaries: useStore.getState().monthlySummaries,
            chatMessages: useStore.getState().chatMessages,
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

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const workbook = XLSX.utils.book_new();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transactionsData = transactions.map((t: any) => ({
            Date: t.date,
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Description: t.description,
            SpaceId: t.spaceId
        }));
        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assetsData = assets.map((a: any) => ({
            Name: a.name,
            Type: a.type,
            Value: a.value,
            Quantity: a.quantity || '',
            'Price Per Unit': a.pricePerUnit || '',
            Bucket: a.bucket,
            SpaceId: a.spaceId,
            'Last Updated': a.lastUpdated
        }));
        const assetsSheet = XLSX.utils.json_to_sheet(assetsData);
        XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Assets');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const budgetsData = budgets.map((b: any) => ({
            Category: b.category,
            Amount: b.amount,
            Period: b.period,
            SpaceId: b.spaceId
        }));
        const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
        XLSX.utils.book_append_sheet(workbook, budgetsSheet, 'Budgets');

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
                if (!json.transactions || !Array.isArray(json.transactions)) {
                    throw new Error('Invalid backup file format');
                }
                if (window.confirm('Warning: This will REPLACE all your current data with the backup. This action cannot be undone. Are you sure?')) {
                    importData({
                        transactions: json.transactions || [],
                        assets: json.assets || [],
                        budgets: json.budgets || [],
                        monthlySummaries: json.monthlySummaries || [],
                        chatMessages: json.chatMessages || [],
                        investmentLogs: json.investmentLogs || [],
                        settings: json.settings || settings
                    });
                    setImportStatus('Restore successful!');
                    setTimeout(() => setImportStatus(''), 3000);
                }
            } catch (err) {
                console.error(err);
                setImportStatus('Error parsing file.');
            }
        };
        reader.readAsText(file);
    };

    const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const XLSX = await import('xlsx');
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const importedCount = { transactions: 0, assets: 0 };
                // ... (Keep existing excel import logic but reuse helper functions if needed or keep inline)
                // For brevity in this replacement, I'll simplify the inline logic or assume it is moved.
                // To avoid breaking, I will copy the core logic here.

                const excelDateToISOString = (excelDate: unknown): string => {
                    if (typeof excelDate === 'number') {
                        const date = new Date((excelDate - 25569) * 86400 * 1000);
                        return date.toISOString().split('T')[0];
                    }
                    if (excelDate instanceof Date) {
                        return excelDate.toISOString().split('T')[0];
                    }
                    if (typeof excelDate === 'string' || typeof excelDate === 'number' || excelDate instanceof Date) {
                        const parsed = new Date(excelDate);
                        if (!isNaN(parsed.getTime())) {
                            return parsed.toISOString().split('T')[0];
                        }
                    }
                    return new Date().toISOString().split('T')[0];
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapAssetType = (type: any): any => {
                    if (!type) return 'other';
                    const typeStr = type.toString().toLowerCase();
                    const mapping: Record<string, string> = {
                        'cash': 'cash', 'saving': 'saving', 'stock': 'stock', 'bond': 'bond',
                        'gold': 'gold', 'crypto': 'crypto', 'property': 'property', 'real estate': 'property'
                    };
                    return mapping[typeStr] || 'other';
                };

                const mapAssetBucket = (type: string): 'cash' | 'investment' | 'receivable' | 'payable' => {
                    if (['cash', 'saving'].includes(type)) return 'cash';
                    if (['stock', 'bond', 'gold', 'crypto', 'property', 'real_estate'].includes(type)) return 'investment';
                    if (type === 'receivable') return 'receivable';
                    if (type === 'payable') return 'payable';
                    return 'cash';
                };

                if (workbook.SheetNames.includes('Income')) {
                    const incomeSheet = workbook.Sheets['Income'];
                    const incomeData = XLSX.utils.sheet_to_json(incomeSheet);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    incomeData.forEach((row: any) => {
                        if (row['Date'] && row['Amount']) {
                            addTransaction({
                                id: crypto.randomUUID(),
                                date: excelDateToISOString(row['Date']),
                                amount: parseFloat(row['Amount']) || 0,
                                category: row['Category'] || 'Income',
                                description: row['Description'] || row['Note'] || '',
                                type: 'income',
                                spaceId: 'personal'
                            });
                            importedCount.transactions++;
                        }
                    });
                }
                if (workbook.SheetNames.includes('Expense')) {
                    const expenseSheet = workbook.Sheets['Expense'];
                    const expenseData = XLSX.utils.sheet_to_json(expenseSheet);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    expenseData.forEach((row: any) => {
                        if (row['Date'] && row['Amount']) {
                            addTransaction({
                                id: crypto.randomUUID(),
                                date: excelDateToISOString(row['Date']),
                                amount: parseFloat(row['Amount']) || 0,
                                category: row['Category'] || 'Expense',
                                description: row['Description'] || row['Note'] || '',
                                type: 'expense',
                                spaceId: 'personal'
                            });
                            importedCount.transactions++;
                        }
                    });
                }
                if (workbook.SheetNames.includes('Asset')) {
                    const assetSheet = workbook.Sheets['Asset'];
                    const assetData = XLSX.utils.sheet_to_json(assetSheet);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                spaceId: 'personal',
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

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {t.settings.demoMode}
                </h3>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">{t.settings.demoModeDesc}<br /><span className="font-bold text-destructive">{t.settings.demoModeWarning}</span></p>
                        <button
                            onClick={() => {
                                if (window.confirm(t.settings.demoModeWarning)) {
                                    importData({ ...generateDemoData(), chatMessages: [] });
                                    alert('Demo data loaded!');
                                }
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors w-fit"
                        >
                            <Database className="h-4 w-4" />
                            {t.settings.loadDemoData}
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {t.settings.dataManagement}
                </h3>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <button onClick={handleExport} className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <Download className="h-4 w-4" /> {t.settings.exportJSON}
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 border-t pt-4">
                        <button onClick={handleExcelExport} className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <FileSpreadsheet className="h-4 w-4" /> {t.settings.exportExcel}
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 border-t pt-4">
                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <Upload className="h-4 w-4" /> {t.settings.importJSON}
                        </button>
                        {importStatus && <p className="text-xs font-medium text-green-600 text-center">{importStatus}</p>}
                    </div>
                    <div className="flex flex-col gap-2 border-t pt-4">
                        <input type="file" ref={excelInputRef} onChange={handleExcelImport} accept=".xlsx,.xls" className="hidden" />
                        <button onClick={() => excelInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <FileSpreadsheet className="h-4 w-4" /> {t.settings.importExcel}
                        </button>
                        {excelImportStatus && <p className="text-xs font-medium text-green-600 text-center">{excelImportStatus}</p>}
                    </div>
                    <div className="border-t pt-4">
                        <button className="flex items-center justify-center gap-2 w-full rounded-md border border-destructive/50 text-destructive bg-background px-4 py-2 text-sm font-medium hover:bg-destructive/10" onClick={() => { if (confirm('Are you sure?')) { localStorage.clear(); window.location.reload(); } }}>
                            <Trash2 className="h-4 w-4" /> {t.settings.resetAllData}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CategoryManagementProps {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
}

function CategoryManagement({ settings, updateSettings }: CategoryManagementProps) {
    const { t } = useTranslation();
    const [newExpense, setNewExpense] = useState('');
    const [newIncome, setNewIncome] = useState('');

    const [newInvestment, setNewInvestment] = useState('');

    const addCategory = (type: 'expense' | 'income' | 'investment', value: string, setter: (v: string) => void) => {
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

    const removeCategory = (type: 'expense' | 'income' | 'investment', value: string) => {
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
                    {t.settings.categoryManagement}
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Expense Categories */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium">{t.settings.expenseCategories}</label>
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
                                placeholder={t.settings.newExpenseCategory}
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
                        <label className="text-sm font-medium">{t.settings.incomeCategories}</label>
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
                                placeholder={t.settings.newIncomeCategory}
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

                    {/* Investment Categories */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Investment Types</label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {(settings.categories?.investment || []).map((cat: string) => (
                                <div key={cat} className="flex items-center justify-between p-2 rounded-md bg-muted/50 group">
                                    <span className="text-sm">{cat}</span>
                                    <button
                                        onClick={() => removeCategory('investment', cat)}
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
                                placeholder="New type..."
                                value={newInvestment}
                                onChange={(e) => setNewInvestment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCategory('investment', newInvestment, setNewInvestment)}
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                onClick={() => addCategory('investment', newInvestment, setNewInvestment)}
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

interface SpaceManagementProps {
    settings: AppSettings;
    addSpace: (name: string) => void;
    updateSpace: (id: string, name: string) => void;
    removeSpace: (id: string) => void;
    activeSpaceId: string;
}

function SpaceManagement({ settings, addSpace, updateSpace, removeSpace, activeSpaceId }: SpaceManagementProps) {
    const { t } = useTranslation();
    const [newSpaceName, setNewSpaceName] = useState('');
    const [editingSpace, setEditingSpace] = useState<{ id: string, name: string } | null>(null);

    const handleAddSpace = () => {
        if (!newSpaceName.trim()) return;
        addSpace(newSpaceName.trim());
        setNewSpaceName('');
    };

    const handleUpdateSpace = () => {
        if (!editingSpace || !editingSpace.name.trim()) return;
        updateSpace(editingSpace.id, editingSpace.name.trim());
        setEditingSpace(null);
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {t.settings.spaceManagement}
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t.settings.yourSpaces}</label>
                        <div className="flex flex-col gap-2">
                            {settings.spaces?.map((space: { id: string; name: string }) => (
                                <div key={space.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border group">
                                    {editingSpace?.id === space.id ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <input
                                                type="text"
                                                value={editingSpace!.name}
                                                onChange={(e) => setEditingSpace({ id: space.id, name: e.target.value })}
                                                className="flex-1 px-2 py-1 text-sm rounded-md border bg-background"
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateSpace} className="p-1 px-2 text-xs bg-primary text-primary-foreground rounded">Save</button>
                                            <button onClick={() => setEditingSpace(null)} className="p-1 px-2 text-xs bg-muted text-muted-foreground rounded">Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${space.id === activeSpaceId ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="font-medium text-sm">{space.name}</span>
                                                {space.id === activeSpaceId && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingSpace(space)}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-background"
                                                    title="Rename"
                                                >
                                                    <span className="sr-only">Rename</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                </button>
                                                {settings.spaces.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete "${space.name}" and ALL its data? This cannot be undone.`)) {
                                                                removeSpace(space.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-background"
                                                        title="Delete Space"
                                                        disabled={settings.spaces.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Create new space (e.g. Travel, Business)..."
                            value={newSpaceName}
                            onChange={(e) => setNewSpaceName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSpace()}
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleAddSpace}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Space
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
function SecuritySettings({ settings, updateSettings, t }: SettingsProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [step, setStep] = useState<'verify' | 'set'>('verify'); // For change flow
    const [error, setError] = useState('');

    const handleSetPin = () => {
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }
        if (pin !== confirmPin) {
            setError(t.settings?.security?.pinMismatch || 'PINs do not match');
            return;
        }

        useStore.getState().setPin(pin);
        resetState();
    };

    const handleVerifyCurrentPin = () => {
        const isValid = useStore.getState().verifyPin(currentPin);
        if (isValid) {
            setStep('set');
            setError('');
            setCurrentPin('');
        } else {
            setError(t.settings?.security?.incorrectPin || 'Incorrect PIN');
        }
    };

    const resetState = () => {
        setIsSettingPin(false);
        setIsChangingPin(false);
        setStep('verify');
        setPin('');
        setConfirmPin('');
        setCurrentPin('');
        setError('');
    };

    return (
        <div id="security-settings" className="rounded-xl border bg-card p-6 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t.settings.security?.title || 'Security'}
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">{t.settings.security?.enablePin || 'Enable PIN Protection'}</label>
                        <p className="text-xs text-muted-foreground">Require 6-digit PIN to access app</p>
                    </div>
                    {settings.security?.enabled ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsChangingPin(true);
                                    setStep('verify');
                                    setIsSettingPin(false);
                                }}
                                className="text-sm text-primary hover:underline px-2"
                            >
                                {t.settings.security?.changePin || 'Change PIN'}
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(t.settings.security?.disableConfirm || 'Are you sure you want to disable PIN protection?')) {
                                        updateSettings({
                                            security: {
                                                enabled: false,
                                                pin: ''
                                            }
                                        });
                                    }
                                }}
                                className="text-sm text-destructive hover:underline px-2"
                            >
                                Disable
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsSettingPin(true);
                                setIsChangingPin(false);
                            }}
                            className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
                        >
                            Enable
                        </button>
                    )}
                </div>

                {/* Enable PIN Flow */}
                {isSettingPin && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="text-sm font-medium">{t.settings.security?.setPin || 'Set PIN'}</h4>
                        <div className="space-y-2">
                            <input
                                type="password"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder={t.settings.security?.newPin || 'New PIN'}
                                className="w-full p-2 rounded-md border text-sm"
                            />
                            <input
                                type="password"
                                maxLength={6}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder={t.settings.security?.confirmPin || 'Confirm PIN'}
                                className="w-full p-2 rounded-md border text-sm"
                            />
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={resetState} className="px-3 py-1 text-sm">{t.common?.cancel || 'Cancel'}</button>
                                <button onClick={handleSetPin} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change PIN Flow */}
                {isChangingPin && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="text-sm font-medium">{t.settings.security?.changePin || 'Change PIN'}</h4>

                        {step === 'verify' ? (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Enter current PIN to continue</p>
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder={t.settings.security?.currentPin || 'Current PIN'}
                                    className="w-full p-2 rounded-md border text-sm"
                                    autoFocus
                                />
                                {error && <p className="text-xs text-destructive">{error}</p>}
                                <div className="flex justify-end gap-2">
                                    <button onClick={resetState} className="px-3 py-1 text-sm">{t.common?.cancel || 'Cancel'}</button>
                                    <button
                                        onClick={handleVerifyCurrentPin}
                                        disabled={currentPin.length !== 6}
                                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder={t.settings.security?.newPin || 'New PIN'}
                                    className="w-full p-2 rounded-md border text-sm"
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder={t.settings.security?.confirmPin || 'Confirm PIN'}
                                    className="w-full p-2 rounded-md border text-sm"
                                />
                                {error && <p className="text-xs text-destructive">{error}</p>}
                                <div className="flex justify-end gap-2">
                                    <button onClick={resetState} className="px-3 py-1 text-sm">{t.common?.cancel || 'Cancel'}</button>
                                    <button onClick={handleSetPin} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
