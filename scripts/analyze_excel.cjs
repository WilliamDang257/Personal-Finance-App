const XLSX = require('xlsx');
const fs = require('fs');

const filePath = "C:\\Users\\tuanh\\OneDrive - FPT Corporation\\Documents\\Finance\\Personal Finance 2026.xlsx";

try {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        process.exit(1);
    }
    const workbook = XLSX.readFile(filePath);
    console.log("Sheet Names:", workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        // limited to first 5 rows to avoid spamming
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        data.slice(0, 5).forEach(row => console.log(JSON.stringify(row)));

        // Also print column headers if possible (first row)
        if (data.length > 0) {
            console.log("Headers:", JSON.stringify(data[0]));
        }
    });
} catch (e) {
    console.error("Error reading excel:", e);
}
