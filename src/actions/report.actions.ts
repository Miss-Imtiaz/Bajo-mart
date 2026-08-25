import { prisma } from "@/lib/prisma";
import { sumDecimals, sumExpensesByVendor } from "@/lib/calculations";
import Decimal from "decimal.js";

export async function getMonthlyReport(year: number, month: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const entries = await prisma.dailyEntry.findMany({
    where: { entryDate: { gte: startDate, lt: endDate } },
    include: { expenses: { include: { vendor: true } }, fuelGallons: true },
    orderBy: { entryDate: "asc" },
  });

  const toDecimal = (v: unknown) => new Decimal(v as any);

  const totals = {
    mopSale: sumDecimals(entries.map((e) => toDecimal(e.mopSale))),
    eft: sumDecimals(entries.map((e) => toDecimal(e.eft))),
    gasSale: sumDecimals(entries.map((e) => toDecimal(e.gasSale))),
    totalCard: sumDecimals(entries.map((e) => toDecimal(e.totalCard))),
    lottoTotal: sumDecimals(entries.map((e) => toDecimal(e.lottoTotal))),
    lottoCommission: sumDecimals(entries.map((e) => toDecimal(e.lottoCommission))),
    payCreditCard: sumDecimals(entries.map((e) => toDecimal(e.payCreditCard))),
    payCashInHand: sumDecimals(entries.map((e) => toDecimal(e.payCashInHand))),
    storeSale: sumDecimals(entries.map((e) => toDecimal(e.storeSale))),
    storeTax: sumDecimals(entries.map((e) => toDecimal(e.storeTax))),
    totalBankExpense: sumDecimals(entries.map((e) => toDecimal(e.totalBankExpense))),
    totalCashExpense: sumDecimals(entries.map((e) => toDecimal(e.totalCashExpense))),
    totalExpense: sumDecimals(entries.map((e) => toDecimal(e.totalExpense))),
  };

  const allExpenseRows = entries.flatMap((e) =>
    e.expenses.map((exp) => ({
      vendorId: exp.vendorId,
      vendorName: exp.vendor.name,
      vendorGroup: exp.vendor.group,
      bankAmount: toDecimal(exp.bankAmount),
      cashAmount: toDecimal(exp.cashAmount),
    }))
  );

  const byVendor = sumExpensesByVendor(allExpenseRows);

  const vendorRows = Object.entries(byVendor).map(([vendorId, totals]) => {
    const sample = allExpenseRows.find((r) => r.vendorId === vendorId)!;
    return {
      vendorId,
      name: sample.vendorName,
      group: sample.vendorGroup,
      bank: totals.bank,
      cash: totals.cash,
      total: totals.bank.plus(totals.cash),
    };
  });

  return { year, month, daysWithEntries: entries.length, totals, vendorRows };
}

export async function getYearlyReport(year: number) {
  const startDate = new Date(Date.UTC(year, 0, 1));
  const endDate = new Date(Date.UTC(year + 1, 0, 1));

  const entries = await prisma.dailyEntry.findMany({
    where: { entryDate: { gte: startDate, lt: endDate } },
    include: { expenses: { include: { vendor: true } } },
    orderBy: { entryDate: "asc" },
  });

  const toDecimal = (v: unknown) => new Decimal(v as any);

  const totals = {
    mopSale: sumDecimals(entries.map((e) => toDecimal(e.mopSale))),
    eft: sumDecimals(entries.map((e) => toDecimal(e.eft))),
    gasSale: sumDecimals(entries.map((e) => toDecimal(e.gasSale))),
    totalCard: sumDecimals(entries.map((e) => toDecimal(e.totalCard))),
    lottoTotal: sumDecimals(entries.map((e) => toDecimal(e.lottoTotal))),
    lottoCommission: sumDecimals(entries.map((e) => toDecimal(e.lottoCommission))),
    payCreditCard: sumDecimals(entries.map((e) => toDecimal(e.payCreditCard))),
    payCashInHand: sumDecimals(entries.map((e) => toDecimal(e.payCashInHand))),
    storeSale: sumDecimals(entries.map((e) => toDecimal(e.storeSale))),
    storeTax: sumDecimals(entries.map((e) => toDecimal(e.storeTax))),
    totalBankExpense: sumDecimals(entries.map((e) => toDecimal(e.totalBankExpense))),
    totalCashExpense: sumDecimals(entries.map((e) => toDecimal(e.totalCashExpense))),
    totalExpense: sumDecimals(entries.map((e) => toDecimal(e.totalExpense))),
  };

  const allExpenseRows = entries.flatMap((e) =>
    e.expenses.map((exp) => ({
      vendorId: exp.vendorId,
      vendorName: exp.vendor.name,
      vendorGroup: exp.vendor.group,
      bankAmount: toDecimal(exp.bankAmount),
      cashAmount: toDecimal(exp.cashAmount),
    }))
  );

  const byVendor = sumExpensesByVendor(allExpenseRows);
  const vendorRows = Object.entries(byVendor).map(([vendorId, t]) => {
    const sample = allExpenseRows.find((r) => r.vendorId === vendorId)!;
    return {
      vendorId,
      name: sample.vendorName,
      group: sample.vendorGroup,
      bank: t.bank,
      cash: t.cash,
      total: t.bank.plus(t.cash),
    };
  });

  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthEntries = entries.filter((e) => e.entryDate.getUTCMonth() + 1 === monthNum);
    return {
      month: monthNum,
      storeSale: sumDecimals(monthEntries.map((e) => toDecimal(e.storeSale))),
      totalExpense: sumDecimals(monthEntries.map((e) => toDecimal(e.totalExpense))),
      daysWithEntries: monthEntries.length,
    };
  });

  return { year, daysWithEntries: entries.length, totals, vendorRows, monthlyTrend };
}
