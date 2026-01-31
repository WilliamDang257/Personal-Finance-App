import { forwardRef } from 'react';
import type { Transaction, AppSettings } from '../../types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface ReportData {
    period: { start: Date; end: Date; type: string };
    summary: { income: number; expense: number; netNav: number };
    transactions: Transaction[];
    assets: { total: number; liabilities: number; breakdown: Record<string, number> };
    spendingByCategory: Record<string, number>;
    generatedAt: Date;
}

interface ReportDocumentProps {
    data: ReportData;
    settings: AppSettings;
}

export const ReportDocument = forwardRef<HTMLDivElement, ReportDocumentProps>(({ data, settings }, ref) => {
    const formatter = new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : (settings.language === 'ko' ? 'ko-KR' : 'en-US'), {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0
    });

    return (
        <div ref={ref} className="p-8 md:p-12 max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 font-sans print:p-0 print:w-full print:max-w-none">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">Financial Report</h1>
                    <p className="text-slate-500 mt-2 font-medium capitalize">
                        {data.period.type}ly Report • {format(data.period.start, 'MMM d, yyyy')} - {format(data.period.end, 'MMM d, yyyy')}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{settings.appName || 'Personal Finance'}</p>
                    <p className="text-xs text-slate-500 mt-1">Generated on {format(data.generatedAt, 'PPP p')}</p>
                </div>
            </div>

            {/* Financial Position Snapshot */}
            <section className="mb-10">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500 mb-4 border-l-4 border-slate-900 pl-3">Current Financial Position (As of Today)</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500 font-medium uppercase mb-1">Total Assets</p>
                        <p className="text-2xl font-bold text-slate-900">{formatter.format(data.assets.total)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500 font-medium uppercase mb-1">Net Worth</p>
                        <p className="text-2xl font-bold text-slate-900">{formatter.format(data.summary.netNav)}</p>
                    </div>
                </div>

                {/* Asset Breakdown */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {Object.entries(data.assets.breakdown).map(([cat, val]) => (
                        <div key={cat} className="flex justify-between py-2 border-b border-slate-100">
                            <span className="capitalize">{cat.replace('_', ' ')}</span>
                            <span className="font-semibold">{formatter.format(val)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold bg-slate-50 px-2 mt-2">
                        <span>Total Liabilities</span>
                        <span className="text-red-600">-{formatter.format(data.assets.liabilities)}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">* Shows current asset values. Past asset values are not tracked historically.</p>
            </section>

            {/* Cash Flow Summary */}
            <section className="mb-10 page-break-inside-avoid">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500 mb-4 border-l-4 border-slate-900 pl-3">Period Cash Flow</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-green-50 text-green-900 print:bg-slate-50 print:text-slate-900 print:border">
                        <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-600" />
                        <p className="text-xs uppercase font-bold text-green-700/70 mb-1">Income</p>
                        <p className="text-lg font-bold">{formatter.format(data.summary.income)}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 text-red-900 print:bg-slate-50 print:text-slate-900 print:border">
                        <TrendingDown className="w-5 h-5 mx-auto mb-2 text-red-600" />
                        <p className="text-xs uppercase font-bold text-red-700/70 mb-1">Expenses</p>
                        <p className="text-lg font-bold">{formatter.format(data.summary.expense)}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-100 text-slate-900 print:bg-slate-50 print:text-slate-900 print:border">
                        <Wallet className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">Net Savings</p>
                        <p className="text-lg font-bold">{formatter.format(data.summary.income - data.summary.expense)}</p>
                    </div>
                </div>

                {/* Spending Breakdown */}
                {Object.keys(data.spendingByCategory).length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-bold uppercase text-slate-500 mb-3">Spending Breakdown</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            {Object.entries(data.spendingByCategory)
                                .sort(([, a], [, b]) => b - a)
                                .map(([cat, val]) => (
                                    <div key={cat} className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="capitalize">{cat}</span>
                                        <span className="font-semibold">{formatter.format(val)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Transactions */}
            <section className="page-break-inside-avoid">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-500 mb-4 border-l-4 border-slate-900 pl-3">Transaction History</h2>
                <div className="overflow-hidden border rounded-lg border-slate-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No transactions in this period.</td>
                                </tr>
                            ) : (
                                data.transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">{format(new Date(t.date), 'MMM d')}</td>
                                        <td className="px-4 py-3 text-slate-700">{t.category}</td>
                                        <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{t.description}</td>
                                        <td className={`px-4 py-3 font-medium text-right ${t.type === 'income' ? 'text-green-700' : 'text-slate-900'}`}>
                                            {t.type === 'income' ? '+' : ''}{formatter.format(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {data.transactions.length > 20 && (
                    <p className="text-center text-xs text-slate-400 mt-2">Showing all {data.transactions.length} transactions</p>
                )}
            </section>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                <p>Report generated by {settings.appName || 'Personal Finance App'}</p>
            </div>

            <style type="text/css" media="print">
                {`
                    @page { size: auto;  margin: 15mm; }
                    body { -webkit-print-color-adjust: exact; }
                `}
            </style>
        </div>
    );
});

ReportDocument.displayName = 'ReportDocument';
