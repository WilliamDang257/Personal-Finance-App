const XLSX = require('xlsx');
const fs = require('fs');

function transformExcelToJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }

        const workbook = XLSX.readFile(filePath);
        const result = {
            transactions: [],
            assets: [],
            budgets: []
        };

        // Process Income sheet
        if (workbook.SheetNames.includes('Income')) {
            const incomeSheet = workbook.Sheets['Income'];
            const incomeData = XLSX.utils.sheet_to_json(incomeSheet);

            incomeData.forEach(row => {
                if (row['Date'] && row['Amount']) {
                    result.transactions.push({
                        id: crypto.randomUUID(),
                        date: excelDateToISOString(row['Date']),
                        amount: parseFloat(row['Amount']) || 0,
                        category: row['Category'] || 'Income',
                        description: row['Description'] || row['Note'] || '',
                        type: 'income'
                    });
                }
            });
        }

        // Process Expense sheet
        if (workbook.SheetNames.includes('Expense')) {
            const expenseSheet = workbook.Sheets['Expense'];
            const expenseData = XLSX.utils.sheet_to_json(expenseSheet);

            expenseData.forEach(row => {
                if (row['Date'] && row['Amount']) {
                    result.transactions.push({
                        id: crypto.randomUUID(),
                        date: excelDateToISOString(row['Date']),
                        amount: parseFloat(row['Amount']) || 0,
                        category: row['Category'] || 'Expense',
                        description: row['Description'] || row['Note'] || '',
                        type: 'expense'
                    });
                }
            });
        }

        // Process Asset sheet
        if (workbook.SheetNames.includes('Asset')) {
            const assetSheet = workbook.Sheets['Asset'];
            const assetData = XLSX.utils.sheet_to_json(assetSheet);

            assetData.forEach(row => {
                if (row['Name'] && row['Value']) {
                    result.assets.push({
                        id: crypto.randomUUID(),
                        name: row['Name'],
                        type: mapAssetType(row['Type']),
                        value: parseFloat(row['Value']) || 0,
                        currency: 'VND',
                        profile: 'personal',
                        lastUpdated: new Date().toISOString()
                    });
                }
            });
        }

        return result;

    } catch (error) {
        throw new Error(`Error processing Excel: ${error.message}`);
    }
}

function excelDateToISOString(excelDate) {
    if (typeof excelDate === 'number') {
        // Excel dates are days since 1900-01-01
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    if (excelDate instanceof Date) {
        return excelDate.toISOString().split('T')[0];
    }
    // Try to parse as string
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
}

function mapAssetType(type) {
    if (!type) return 'other';
    const typeStr = type.toString().toLowerCase();

    const mapping = {
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
}

// CLI usage
if (require.main === module) {
    const inputPath = process.argv[2] || "C:\\Users\\tuanh\\OneDrive - FPT Corporation\\Documents\\Finance\\Personal Finance 2026.xlsx";
    const outputPath = process.argv[3] || "./finance_import.json";

    try {
        const data = transformExcelToJSON(inputPath);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`✓ Successfully converted Excel to JSON`);
        console.log(`  Transactions: ${data.transactions.length}`);
        console.log(`  Assets: ${data.assets.length}`);
        console.log(`  Output: ${outputPath}`);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

module.exports = { transformExcelToJSON };
