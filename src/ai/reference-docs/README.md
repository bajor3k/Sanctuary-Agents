# Reference Documents - Advisory Agreement Templates

This directory contains **16 reference PDF templates** used to guide AI analysis of advisory agreements.

## Template Structure

Each template has "**XXXXXX**" placeholders where actual client data should appear when filled out.

The AI uses these templates to understand:
- Where specific data fields are located in the document
- The correct structure and layout expected
- Which fields are required for IGO (In Good Order) status

## 16 Template Scenarios

Templates are organized by 4 key attributes:

### 1. Discretion Type
- **Discretionary**: Advisor has discretion to make investment decisions
- **Non-Discretionary**: Advisor requires client approval for trades

### 2. Wrap Status
- **WRAP**: Wrap fee account
- **NON-WRAP**: Traditional fee arrangement

### 3. Fee Structure
- **Flat**: Single percentage fee (e.g., 1%)
- **Tiered**: Fee schedule based on asset tiers (e.g., 0-500k: 1%, 500k-1M: 0.85%)

### 4. Account Holders
- **1 account holder**: Single client signature blocks
- **2 account holders**: Joint account with two sets of signature blocks

## Template Files

1. `Discretionary WRAP Flat (1).pdf`
2. `Discretionary WRAP Flat (2).pdf`
3. `Discretionary WRAP Tiered (1).pdf`
4. `Discretionary WRAP Tiered (2).pdf`
5. `Discretionary NON-WRAP Flat (1).pdf`
6. `Discretionary NON-WRAP Flat (2).pdf`
7. `Discretionary NON-WRAP Tiered (1).pdf`
8. `Discretionary NON-WRAP Tiered (2).pdf`
9. `Non-Discretionary WRAP Flat (1).pdf`
10. `Non-Discretionary WRAP Flat (2).pdf`
11. `Non-Discretionary WRAP Tiered (1).pdf`
12. `Non-Discretionary WRAP Tiered (2).pdf`
13. `Non-Discretionary NON-WRAP Flat (1).pdf`
14. `Non-Discretionary NON-WRAP Flat (2).pdf`
15. `Non-Discretionary NON-WRAP Tiered (1).pdf`
16. `Non-Discretionary NON-WRAP Tiered (2).pdf`

## Expected Data Points (23 Total)

The AI extracts these fields from each document:

### Page 1 (7 fields)
1. Discretionary (checkbox)
2. WRAP (checkbox)
3. Advisor Name
4. Rep Code
5. Client Name(s)
6. Effective Date
7. Account Holders (1 or 2)

### Page 10 (1 field)
8. ADV Received Date

### Page 11 (6 fields)
9. Client Signed (Yes/No)
10. Client Name Printed
11. Client Date
12. Advisor Signed (Yes/No)
13. Advisor Name Printed
14. Advisor Date

### Page 12 (1 field)
15. Account Number

### Page 13 (2 fields)
16. Fee Type (Flat/Tiered)
17. Fee Amount (% or tier table)

### Page 14 (6 fields)
18. Client Signed (Yes/No)
19. Client Name Printed
20. Client Date
21. Advisor Signed (Yes/No)
22. Advisor Name Printed
23. Advisor Date

## Usage

### For Testing (PDF Generator)
The PDF generator randomly selects from these 16 templates to create test documents. The templates are copied as-is (with XXXXXX placeholders) to `/Users/bajor3k/Desktop/Orion Advisory/` for AI analysis testing.

### For Production (Real Client Documents)
When analyzing real uploaded client documents, the AI compares them against the appropriate reference template to verify:
- All required fields are present
- Data is in the correct locations
- The document matches the expected structure
- IGO/NIGO status based on completeness

## Notes

- Templates with **(1)** have single signature blocks
- Templates with **(2)** have dual signature blocks for joint accounts
- **Tiered** fee templates include a fee schedule table
- **Flat** fee templates have a single percentage field
- All "XXXXXX" placeholders indicate where actual data should appear
