const XLSX = require('xlsx');
const fs = require('fs');

const filePath = "C:\\Users\\tuanh\\OneDrive - FPT Corporation\\Documents\\Finance\\Personal Finance 2026.xlsx";

try {
    const workbook = XLSX.readFile(filePath);
    const refSheet = workbook.Sheets['Ref'];
    const data = XLSX.utils.sheet_to_json(refSheet, { header: 1 });

    const categories = {
        transaction: [],
        asset: []
    };

    // Assuming Catelist_basis is in column A (index 0)
    // Assuming Catelist_investment is in column D (index 3)

    // Header is at data[0]
    const headers = data[0];
    const basisIdx = headers.indexOf('Catelist_basis');
    const investIdx = headers.indexOf('Catelist_investment');

    console.log(`Found headers: basis at ${basisIdx}, investment at ${investIdx}`);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (basisIdx !== -1 && row[basisIdx]) {
            categories.transaction.push(row[basisIdx]);
        }
        if (investIdx !== -1 && row[investIdx]) {
            categories.asset.push(row[investIdx]);
        }
    }

    console.log("Transaction Categories:", JSON.stringify(categories.transaction, null, 2));
    console.log("Asset Categories:", JSON.stringify(categories.asset, null, 2));

    fs.writeFileSync('src/data/categories.json', JSON.stringify(categories, null, 2));
    console.log("Saved to src/data/categories.json");

} catch (e) {
    console.error("Error:", e);
}
