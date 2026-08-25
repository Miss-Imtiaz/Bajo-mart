"use server";

import { prisma } from "@/lib/prisma";

export interface AuditHistoryItem {
  id: string;
  changedByName: string;
  changedAt: Date;
  summary: string;
}

const FIELD_LABELS: Record<string, string> = {
  mopSale: "MOP Sale", eft: "EFT", gasSale: "Gas Sale", gasInvoice: "Gas Invoice",
  posFee: "POS Fee", creCarFee: "Cre Car Fee", totalCard: "Total Card", stBalDiff: "ST/Bal Diff",
  lottoTotal: "Lotto Total", lottoTicketSold: "Ticket Sold", lottoCashActivation: "Cash Activation",
  lottoCommission: "Commission", lottoRent: "Rent", payCreditCard: "Credit Card",
  payDebitCard: "Debit Card", payMobil: "Mobil", payEbtCash: "EBT Cash", payCashInHand: "Cash In Hand",
  payFs: "FS", storeSale: "Store Sale", storeTax: "Tax", storeCigTaxPaid: "Cig Tax Paid",
  storeCDeposit: "C. Deposit", storeEDeposit: "E. Deposit", storeTDeposit: "T. Deposit",
};

export async function getDailyEntryAuditHistory(dailyEntryId: string): Promise<AuditHistoryItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: { tableName: "daily_entries", recordId: dailyEntryId },
    include: { changedBy: true },
    orderBy: { changedAt: "desc" },
  });

  const items: AuditHistoryItem[] = [];

  for (const log of logs) {
    if (log.action === "CREATE") {
      items.push({
        id: log.id,
        changedByName: log.changedBy.name,
        changedAt: log.changedAt,
        summary: "created this day's entry",
      });
      continue;
    }

    const oldValues = (log.oldValues as Record<string, unknown>) ?? {};
    const newValues = (log.newValues as Record<string, unknown>) ?? {};
    const changedFields: string[] = [];

    for (const key of Object.keys(newValues)) {
      const label = FIELD_LABELS[key];
      if (!label) continue;
      const oldVal = oldValues[key];
      const newVal = newValues[key];
      if (String(oldVal ?? "0") !== String(newVal ?? "0")) {
        changedFields.push(`${label} from $${oldVal ?? "0"} to $${newVal ?? "0"}`);
      }
    }

    if (changedFields.length === 0) continue;

    items.push({
      id: log.id,
      changedByName: log.changedBy.name,
      changedAt: log.changedAt,
      summary: `changed ${changedFields.join(", ")}`,
    });
  }

  return items;
}
