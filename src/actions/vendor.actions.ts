"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { VendorGroup } from "@prisma/client";

export async function getVendorsByGroup() {
  const vendors = await prisma.vendor.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });

  return {
    OPERATING: vendors.filter((v) => v.group === "OPERATING"),
    WHOLESALE: vendors.filter((v) => v.group === "WHOLESALE"),
    SNACKS_BEVERAGE: vendors.filter((v) => v.group === "SNACKS_BEVERAGE"),
  };
}

export async function createVendor(name: string, group: VendorGroup) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Vendor name cannot be empty." };

  const maxOrder = await prisma.vendor.findFirst({
    where: { group },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.vendor.create({
    data: { name: trimmed, group, sortOrder: (maxOrder?.sortOrder ?? -1) + 1, isActive: true },
  });

  revalidatePath("/vendors");
  return { success: true };
}

export async function renameVendor(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Vendor name cannot be empty." };

  await prisma.vendor.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/vendors");
  return { success: true };
}

export async function setVendorActive(id: string, isActive: boolean) {
  await prisma.vendor.update({ where: { id }, data: { isActive } });
  revalidatePath("/vendors");
  return { success: true };
}

export async function deleteVendor(id: string) {
  const usageCount = await prisma.dailyExpense.count({ where: { vendorId: id } });

  if (usageCount > 0) {
    return {
      success: false,
      error: `This vendor has ${usageCount} expense record(s) and can't be deleted — use Deactivate instead to preserve report history.`,
    };
  }

  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendors");
  return { success: true };
}

export async function getVendorAmountSuggestions() {
  const rows = await prisma.dailyExpense.findMany({
    where: {
      OR: [{ bankAmount: { gt: 0 } }, { cashAmount: { gt: 0 } }],
    },
    orderBy: { createdAt: "desc" },
    select: { vendorId: true, bankAmount: true, cashAmount: true },
    take: 1000,
  });

  const result: Record<string, { bank: string[]; cash: string[] }> = {};

  for (const row of rows) {
    if (!result[row.vendorId]) result[row.vendorId] = { bank: [], cash: [] };

    const bankStr = row.bankAmount.toString();
    const cashStr = row.cashAmount.toString();

    if (Number(bankStr) > 0 && result[row.vendorId].bank.length < 8 && !result[row.vendorId].bank.includes(bankStr)) {
      result[row.vendorId].bank.push(bankStr);
    }
    if (Number(cashStr) > 0 && result[row.vendorId].cash.length < 8 && !result[row.vendorId].cash.includes(cashStr)) {
      result[row.vendorId].cash.push(cashStr);
    }
  }

  return result;
}
