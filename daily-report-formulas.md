# Bajo Mart — Daily Report Formulas (Confirmed from Real Excel File)

Source: June 2026.xlsx (Jun-1 sheet) + BAJO_MART_MONTHLY_ANNUAL.xlsx (Jun 26 sheet), confirmed via screenshots and direct file read.

Status: ✅ **COMPLETE** — all formulas and manual-entry fields confirmed. This file is now the final source of truth for rebuilding the Daily Entry form, database schema, and calculation engine.

---

## Confirmed formulas

### 1. MOB/CARD (Gas section)
`= Cred Card + Debt Card + Mobil`

### 2. CREDIT CARD (Gas Purchase section)
`= Cred Card + Debt Card + Mobil`
*(same source as MOB/CARD)*

### 3. EFT (Gas Purchase section)
`= CREDIT CARD − GAS INVOICE − POS FEE − CRE CAR FEE`

### 4. GAS PROFIT (Lotto section)
`= GAS SALE − GAS INVOICE − POS FEE − CRE CAR FEE`

### 5. LOT/GAS/P/F (Lotto section)
`= COMMISSION + GAS PROFIT`

### 6. STOR BAL DIFF (Payment section)
`= GAS SALE − MOB/CARD`

### 7. PAY NOW (Store section)
`= TAX − CIG TAX PAID`

### 8. TOTAL GALLONS (Gas Gallons section)
`= Regular + Plus + Premium + Diesel`

### 9. Daily Expenses — Group 1 "Total" (Operating — Bank column)
`= sum of every Bank amount in that group's rows`

### 10. Daily Expenses — Group 1 "Total" (Operating — Cash column)
`= sum of every Cash amount in that group's rows`

### 11. Daily Expenses — Group 2 "Total" (Wholesale — Bank column)
`= sum of every Bank amount in that group's rows`

### 12. Daily Expenses — Group 2 "Total" (Wholesale — Cash column)
`= sum of every Cash amount in that group's rows`

### 13. Daily Expenses — Group 3 "Total" (Snacks/Beverage — Bank column)
`= sum of every Bank amount in that group's rows`

### 14. Daily Expenses — Group 3 "Total" (Snacks/Beverage — Cash column)
`= sum of every Cash amount in that group's rows`

### 15. STORE SALE (summary box)
`= pulls directly from the STORE SALE value entered in the Store section` (not a separate calculation — a direct reference/copy)

### 16. TOTAL BANK EXPENSE (summary box)
`= Group 1 Bank Total + Group 2 Bank Total + Group 3 Bank Total`

### 17. TOTAL CASH EXPENSE (summary box)
`= Group 1 Cash Total + Group 2 Cash Total + Group 3 Cash Total`

### 18. TOTAL EXPENSE (summary box)
`= TOTAL BANK EXPENSE + TOTAL CASH EXPENSE`

### 19. NET AMOUNT & TAX (summary box) — from the older daily-sheet layout
`= CASH IN HAND + EBT CASH − TOTAL EXPENSE − STOR BAL DIFF`

---

## Manually typed fields (not calculated — owner types these directly)
- GAS SALE — manual entry
- AMT RECEIV — manual entry
- TOTAL CARD — manual entry (confirmed — not a formula)
- ST/BAL DIFF — manual entry (confirmed — not a formula)
- All other plain (non-red/bold) fields across Gas/Lotto/Payment/Store sections — manual entry
- Every Daily Expense NAME/BANK/CASH cell — manual entry

---

## Note on two slightly different real sheet layouts seen during this process

The client shared two real, in-use files that don't have 100% identical field
sets (the "June 2026.xlsx" daily sheet vs. the "BAJO_MART_MONTHLY_ANNUAL.xlsx"
monthly-tab template). The BAJO_MART_MONTHLY_ANNUAL version is simpler (no Gas
Profit/Lot Gas P/F/Mob Card fields, single day-level Gas Sale instead of
per-fuel-type sale/purchase detail) and uses the Bank/Cash split per vendor
that the client explicitly asked for. **This is the version to build the app
against**, since it's the one confirmed most recently and directly by the
client/owner as the current real report.
