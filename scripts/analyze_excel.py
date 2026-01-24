import sys
import os

try:
    import pandas as pd
except ImportError:
    print("Error: pandas not installed. Please run 'pip install pandas openpyxl'")
    sys.exit(1)

try:
    import openpyxl
except ImportError:
    print("Error: openpyxl not installed. Please run 'pip install pandas openpyxl'")
    sys.exit(1)

file_path = r"C:\Users\tuanh\OneDrive - FPT Corporation\Documents\Finance\Personal Finance 2026.xlsx"

if not os.path.exists(file_path):
    print(f"Error: File not found at {file_path}")
    sys.exit(1)

try:
    xls = pd.ExcelFile(file_path)
    print(f"Sheet names: {xls.sheet_names}")
    for sheet_name in xls.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(xls, sheet_name=sheet_name, nrows=5)
        print(df.to_string())
        print(f"\nColumn types:\n{df.dtypes}")
except Exception as e:
    print(f"Error reading excel: {e}")
