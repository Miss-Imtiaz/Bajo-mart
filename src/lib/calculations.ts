import Decimal from "decimal.js";

function round2(value: Decimal): Decimal {
  return value.toDecimalPlaces(2);
}

export interface GasGallonsInput {
  regular: Decimal;
  plus: Decimal;
  premium: Decimal;
  diesel: Decimal;
}

export interface DailyExpenseRow {
  bankAmount: Decimal;
  cashAmount: Decimal;
}

export interface DailyEntryInput {
  gallons: GasGallonsInput;
  expenseRows: DailyExpenseRow[];
}

export interface DailyEntryCalculated {
  totalGallons: Decimal;
  totalBankExpense: Decimal;
  totalCashExpense: Decimal;
  totalExpense: Decimal;
}

export function calculateDailyEntry(input: DailyEntryInput): DailyEntryCalculated {
  const totalGallons = round2(
    input.gallons.regular.plus(input.gallons.plus).plus(input.gallons.premium).plus(input.gallons.diesel)
  );
  const totalBankExpense = round2(
    input.expenseRows.reduce((sum, row) => sum.plus(row.bankAmount), new Decimal(0))
  );
  const totalCashExpense = round2(
    input.expenseRows.reduce((sum, row) => sum.plus(row.cashAmount), new Decimal(0))
  );
  const totalExpense = round2(totalBankExpense.plus(totalCashExpense));
  return { totalGallons, totalBankExpense, totalCashExpense, totalExpense };
}

export function sumDecimals(values: Decimal[]): Decimal {
  return round2(values.reduce((sum, v) => sum.plus(v), new Decimal(0)));
}

export function sumExpensesByVendor(
  rows: { vendorId: string; bankAmount: Decimal; cashAmount: Decimal }[]
): Record<string, { bank: Decimal; cash: Decimal }> {
  const result: Record<string, { bank: Decimal; cash: Decimal }> = {};
  for (const row of rows) {
    if (!result[row.vendorId]) {
      result[row.vendorId] = { bank: new Decimal(0), cash: new Decimal(0) };
    }
    result[row.vendorId].bank = result[row.vendorId].bank.plus(row.bankAmount);
    result[row.vendorId].cash = result[row.vendorId].cash.plus(row.cashAmount);
  }
  for (const vendorId of Object.keys(result)) {
    result[vendorId].bank = round2(result[vendorId].bank);
    result[vendorId].cash = round2(result[vendorId].cash);
  }
  return result;
}
