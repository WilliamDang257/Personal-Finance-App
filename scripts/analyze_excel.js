const XLSX = require('xlsx');
const fs = require('fs');

const FILE_PATH = "C:\\Users\\tuanh\\OneDrive - FPT Corporation\\Documents\\Finance\\Personal Finance 2026.xlsx";

try {
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`Error: File not found at ${FILE_PATH}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(FILE_PATH);
    console.log("Sheet names:", workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
            console.log("Headers:", jsonData[0]);
            console.log("First 3 rows:", jsonData.slice(1, 4));
        } else {
            console.log("Empty sheet");
        }
    });

} catch (error) {
    console.error("Error reading excel:", error.message);
}
