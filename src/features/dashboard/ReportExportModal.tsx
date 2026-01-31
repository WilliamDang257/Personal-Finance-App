import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X, Download } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { startOfWeek, endOfWeek, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ReportDocument } from './ReportDocument';

interface ReportExportModalProps {
    onClose: () => void;
}

export function ReportExportModal({ onClose }: ReportExportModalProps) {
    const { transactions, assets, settings } = useStore();
    const [reportType, setReportType] = useState<'week' | 'month' | 'year'>('week');

    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Financial_Report_${reportType}_${new Date().toISOString().split('T')[0]}`,
    });

    // --- Report Data Logic ---
    const getReportData = () => {
        const date = new Date();
        let start: Date, end: Date;

        if (reportType === 'week') {
            start = startOfWeek(date, { weekStartsOn: 1 });
            end = endOfWeek(date, { weekStartsOn: 1 });
        } else if (reportType === 'month') {
            start = startOfMonth(date);
            end = endOfMonth(date);
        } else {
            start = startOfYear(date);
            end = endOfYear(date);
        }

        const filteredTransactions = transactions.filter(t => {
            if (t.spaceId !== settings.activeSpace) return false;
            const tDate = parseISO(t.date);
            return isWithinInterval(tDate, { start, end });
        });

        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        // Assets are "Current State" regardless of period
        const totalAssets = assets
            .filter(a => a.spaceId === settings.activeSpace && ['cash', 'investment', 'receivable'].includes(a.bucket))
            .reduce((acc, a) => acc + a.value, 0);

        const totalLiabilities = assets
            .filter(a => a.spaceId === settings.activeSpace && a.bucket === 'payable')
            .reduce((acc, a) => acc + a.value, 0);

        // Group Assets by Category
        const assetsByCategory: Record<string, number> = {};
        assets.filter(a => a.spaceId === settings.activeSpace).forEach(a => {
            const cat = a.type; // or a.bucket
            assetsByCategory[cat] = (assetsByCategory[cat] || 0) + a.value;
        });

        // Group Spending by Category
        const spendingByCategory: Record<string, number> = {};
        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const cat = t.category;
                spendingByCategory[cat] = (spendingByCategory[cat] || 0) + t.amount;
            });

        return {
            period: { start, end, type: reportType },
            summary: { income, expense, netNav: totalAssets - totalLiabilities },
            transactions: filteredTransactions,
            assets: { total: totalAssets, liabilities: totalLiabilities, breakdown: assetsByCategory },
            spendingByCategory,
            generatedAt: new Date()
        };
    };

    const reportData = getReportData();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-card rounded-xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export Financial Report
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-medium">Report Period (Current)</label>
                        <div className="flex rounded-md border bg-muted p-1">
                            {(['week', 'month', 'year'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-all capitalize ${reportType === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                            <Printer className="w-4 h-4" />
                            Print / PDF
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto bg-muted/20 p-8">
                    <div className="max-w-[210mm] mx-auto bg-white shadow-lg origin-top scale-90 sm:scale-100">
                        <ReportDocument ref={reportRef} data={reportData} settings={settings} />
                    </div>
                </div>
            </div>
        </div>
    );
}
