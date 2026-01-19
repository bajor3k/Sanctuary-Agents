
#!/usr/bin/env python
import sys
import pandas as pd
import traceback

def main():
    try:
        if len(sys.argv) != 5:
            print("Usage: merge_3m_cash.py PYCASH1.xlsx PYCASH2.xlsx PYPI.xlsx OUTPUT.xlsx")
            sys.exit(1)

        in_pycash1, in_pycash2, in_pypi, out_path = sys.argv[1:5]

        # Read CSV/XLSX flexibly (handles .csv or .xlsx)
        def read_any(path):
            try:
                if path.lower().endswith(".csv"):
                    return pd.read_csv(path)
                return pd.read_excel(path)
            except Exception as e:
                # Raise the exception to be caught by the outer try/except block
                raise Exception(f"Error reading file {path}: {e}")

        df_pycash1 = read_any(in_pycash1)
        df_pycash2 = read_any(in_pycash2)
        df_pypi   = read_any(in_pypi)

        # --- Example merge logic (adjust to your columns) ---
        
        # Combine the two PYCASH files
        df_pycash_combined = pd.concat([df_pycash1, df_pycash2], ignore_index=True)

        # Normalize "Account" key
        for df in (df_pycash_combined, df_pypi):
            if "Account" in df.columns:
                # Ensure account is string type and stripped of whitespace before merge
                df["Account"] = df["Account"].astype(str).str.strip()
            else:
                # If 'Account' column is missing, we can't merge.
                # Handle this case by raising a specific error.
                raise ValueError(f"Required 'Account' column not found in one of the dataframes.")

        # Start with combined cash data
        merged = df_pycash_combined
        
        # Merge with PYPI data
        if not df_pypi.empty and "Account" in df_pypi.columns:
            merged = merged.merge(df_pypi, on="Account", how="outer", suffixes=("", "_pypi"))
        
        # Fill NaN values that might result from outer joins
        merged.fillna("N/A", inplace=True)


        # Write XLSX
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            merged.to_excel(writer, index=False, sheet_name="Merged_3M_Cash_Report")
        
        print(f"Successfully merged files into {out_path}")

    except Exception as e:
        # Print the full traceback to stderr
        traceback.print_exc(file=sys.stderr)
        # Exit with a non-zero status code to indicate failure
        sys.exit(1)


if __name__ == "__main__":
    main()
