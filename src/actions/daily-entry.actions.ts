"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDailyEntry } from "@/lib/calculations";
import { parseDateOnly } from "@/lib/dates";
import { FuelType } from "@prisma/client";

export interface DailyEntryFormData {
  entryDate: string; // "YYYY-MM-DD"
  mopSale: string;
  eft: string;
  gasSale: string;
  gasInvoice: string;
  posFee: string;
  creCarFee: string;
  totalCard: string; // confirmed MANUAL entry — never calculated
  stBalDiff: string; // confirmed MANUAL entry — never calculated
  gallons: { REGULAR: string; PLUS: string; PREMIUM: string; DIESEL: string };
  lottoTotal: string;
  lottoTicketSold: string;
  lottoCashActivation: string;
  lottoCommission: string;
  lottoRent: string;
  payCreditCard: string;
  payDebitCard: string;
  payMobil: string;
  payEbtCash: string;
  payCashInHand: string;
  payFs: string;
  storeSale: string;
  storeTax: string;
  storeCigTaxPaid: string;
  storeCDeposit: string;
  storeEDeposit: string;
  storeTDeposit: string;
  expenses: { vendorId: string; bankAmount: string; cashAmount: string }[];
}

function d(value: string): Decimal {
  return new Decimal(value || 0);
}

export async function getDailyEntry(dateStr: string) {
  const date = parseDateOnly(dateStr);

  const entry = await prisma.dailyEntry.findUnique({
    where: { entryDate: date },
    include: { fuelGallons: true, expenses: true },
  });

  return entry;
}

export interface SaveResult {
  success: boolean;
  error?: string;
}

export async function saveDailyEntry(data: DailyEntryFormData): Promise<SaveResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const userId = (session.user as any).id as string;
  const date = parseDateOnly(data.entryDate);

  // Validate: every expense with an amount > 0 needs to make sense (server-side
  // validation — never trust the frontend alone).
  for (const row of data.expenses) {
    if (d(row.bankAmount).lessThan(0) || d(row.cashAmount).lessThan(0)) {
      return { success: false, error: "Expense amounts cannot be negative." };
    }
  }

  // TOTAL CARD and ST/BAL DIFF are confirmed MANUAL entries (daily-report-formulas.md) —
  // they come straight from the form, never calculated here.
  const calc = calculateDailyEntry({
    gallons: {
      regular: d(data.gallons.REGULAR),
      plus: d(data.gallons.PLUS),
      premium: d(data.gallons.PREMIUM),
      diesel: d(data.gallons.DIESEL),
    },
    expenseRows: data.expenses.map((e) => ({
      bankAmount: d(e.bankAmount),
      cashAmount: d(e.cashAmount),
    })),
  });

  try {
    await prisma.$transaction(async (tx) => {
      const entry = await tx.dailyEntry.upsert({
        where: { entryDate: date },
        create: {
          entryDate: date,
          mopSale: d(data.mopSale).toNumber(),
          eft: d(data.eft).toNumber(),
          gasSale: d(data.gasSale).toNumber(),
          gasInvoice: d(data.gasInvoice).toNumber(),
          posFee: d(data.posFee).toNumber(),
          creCarFee: d(data.creCarFee).toNumber(),
          totalCard: d(data.totalCard).toNumber(),
          stBalDiff: d(data.stBalDiff).toNumber(),
          lottoTotal: d(data.lottoTotal).toNumber(),
          lottoTicketSold: d(data.lottoTicketSold).toNumber(),
          lottoCashActivation: d(data.lottoCashActivation).toNumber(),
          lottoCommission: d(data.lottoCommission).toNumber(),
          lottoRent: d(data.lottoRent).toNumber(),
          payCreditCard: d(data.payCreditCard).toNumber(),
          payDebitCard: d(data.payDebitCard).toNumber(),
          payMobil: d(data.payMobil).toNumber(),
          payEbtCash: d(data.payEbtCash).toNumber(),
          payCashInHand: d(data.payCashInHand).toNumber(),
          payFs: d(data.payFs).toNumber(),
          storeSale: d(data.storeSale).toNumber(),
          storeTax: d(data.storeTax).toNumber(),
          storeCigTaxPaid: d(data.storeCigTaxPaid).toNumber(),
          storeCDeposit: d(data.storeCDeposit).toNumber(),
          storeEDeposit: d(data.storeEDeposit).toNumber(),
          storeTDeposit: d(data.storeTDeposit).toNumber(),
          totalBankExpense: calc.totalBankExpense.toNumber(),
          totalCashExpense: calc.totalCashExpense.toNumber(),
          totalExpense: calc.totalExpense.toNumber(),
          createdById: userId,
        },
        update: {
          mopSale: d(data.mopSale).toNumber(),
          eft: d(data.eft).toNumber(),
          gasSale: d(data.gasSale).toNumber(),
          gasInvoice: d(data.gasInvoice).toNumber(),
          posFee: d(data.posFee).toNumber(),
          creCarFee: d(data.creCarFee).toNumber(),
          totalCard: d(data.totalCard).toNumber(),
          stBalDiff: d(data.stBalDiff).toNumber(),
          lottoTotal: d(data.lottoTotal).toNumber(),
          lottoTicketSold: d(data.lottoTicketSold).toNumber(),
          lottoCashActivation: d(data.lottoCashActivation).toNumber(),
          lottoCommission: d(data.lottoCommission).toNumber(),
          lottoRent: d(data.lottoRent).toNumber(),
          payCreditCard: d(data.payCreditCard).toNumber(),
          payDebitCard: d(data.payDebitCard).toNumber(),
          payMobil: d(data.payMobil).toNumber(),
          payEbtCash: d(data.payEbtCash).toNumber(),
          payCashInHand: d(data.payCashInHand).toNumber(),
          payFs: d(data.payFs).toNumber(),
          storeSale: d(data.storeSale).toNumber(),
          storeTax: d(data.storeTax).toNumber(),
          storeCigTaxPaid: d(data.storeCigTaxPaid).toNumber(),
          storeCDeposit: d(data.storeCDeposit).toNumber(),
          storeEDeposit: d(data.storeEDeposit).toNumber(),
          storeTDeposit: d(data.storeTDeposit).toNumber(),
          totalBankExpense: calc.totalBankExpense.toNumber(),
          totalCashExpense: calc.totalCashExpense.toNumber(),
          totalExpense: calc.totalExpense.toNumber(),
        },
      });

      // Replace gallons for this day
      await tx.gasGallons.deleteMany({ where: { dailyEntryId: entry.id } });
      const fuelTypes: FuelType[] = ["REGULAR", "PLUS", "PREMIUM", "DIESEL"];
      for (const fuelType of fuelTypes) {
        const gallons = d(data.gallons[fuelType]);
        if (gallons.greaterThan(0)) {
          await tx.gasGallons.create({
            data: { dailyEntryId: entry.id, fuelType, gallons: gallons.toNumber() },
          });
        }
      }

      // Replace expenses for this day
      await tx.dailyExpense.deleteMany({ where: { dailyEntryId: entry.id } });
      for (const row of data.expenses) {
        const bank = d(row.bankAmount);
        const cash = d(row.cashAmount);
        if (bank.greaterThan(0) || cash.greaterThan(0)) {
          await tx.dailyExpense.create({
            data: {
              dailyEntryId: entry.id,
              vendorId: row.vendorId,
              bankAmount: bank.toNumber(),
              cashAmount: cash.toNumber(),
            },
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
    return { success: false, error: "Not saved. Check your connection and try again." };
  }

  revalidatePath("/");
  revalidatePath(`/daily-entry/${data.entryDate}`);
  return { success: true };
}