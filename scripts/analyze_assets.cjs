const XLSX = require('xlsx');
const fs = require('fs');

const filePath = "C:\\Users\\tuanh\\OneDrive - FPT Corporation\\Documents\\Finance\\Personal Finance 2026.xlsx";

try {
    const workbook = XLSX.readFile(filePath);
    const assetSheet = workbook.Sheets['Assets'];
    const data = XLSX.utils.sheet_to_json(assetSheet, { header: 1 });

    console.log("Assets Sheet Headers:", data[0]);
    console.log("Sample Rows:", JSON.stringify(data.slice(1, 5), null, 2));

} catch (e) {
    console.error("Error:", e);
}
