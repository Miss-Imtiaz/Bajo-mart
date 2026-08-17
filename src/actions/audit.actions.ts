"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Records a change to a daily_entries row.
// Called from within the same transaction as the save, so the audit trail
// can never drift from what actually happened.
// Architecture Doc Section 5.6 / Security Doc Section 2.
export async function recordDailyEntryAudit(params: {
  dailyEntryId: string;
  userId: string;
  action: "CREATE" | "UPDATE";
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      tableName: "daily_entries",
      recordId: params.dailyEntryId,
      action: params.action,
      changedById: params.userId,

      // Prisma JSON fields require Prisma.InputJsonValue.
      // oldValues is nullable, so null is converted to undefined.
      oldValues:
        params.oldValues === null
          ? undefined
          : (params.oldValues as Prisma.InputJsonValue),

      newValues: params.newValues as Prisma.InputJsonValue,
    },
  });
}

export interface AuditHistoryItem {
  id: string;
  changedByName: string;
  changedAt: Date;
  summary: string;
  // Example:
  // "changed Store Sale from $40.00 to $45.00"
}

// Human-readable field name lookup for the plain-English summaries.
const FIELD_LABELS: Record<string, string> = {
  mopSale: "MOP Sale",
  eft: "EFT",
  gasSale: "Gas Sale",
  gasInvoice: "Gas Invoice",
  posFee: "POS Fee",
  creCarFee: "Cre Car Fee",
  totalCard: "Total Card",
  stBalDiff: "ST/Bal Diff",
  lottoTotal: "Lotto Total",
  lottoTicketSold: "Ticket Sold",
  lottoCashActivation: "Cash Activation",
  lottoCommission: "Commission",
  lottoRent: "Rent",
  payCreditCard: "Credit Card",
  payDebitCard: "Debit Card",
  payMobil: "Mobil",
  payEbtCash: "EBT Cash",
  payCashInHand: "Cash In Hand",
  payFs: "FS",
  storeSale: "Store Sale",
  storeTax: "Tax",
  storeCigTaxPaid: "Cig Tax Paid",
  storeCDeposit: "C. Deposit",
  storeEDeposit: "E. Deposit",
  storeTDeposit: "T. Deposit",
};

export async function getDailyEntryAuditHistory(
  dailyEntryId: string
): Promise<AuditHistoryItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      tableName: "daily_entries",
      recordId: dailyEntryId,
    },
    include: {
      changedBy: true,
    },
    orderBy: {
      changedAt: "desc",
    },
  });

  const items: AuditHistoryItem[] = [];

  for (const log of logs) {
    // Handle CREATE actions.
    if (log.action === "CREATE") {
      items.push({
        id: log.id,
        changedByName: log.changedBy.name,
        changedAt: log.changedAt,
        summary: "created this day's entry",
      });

      continue;
    }

    // Convert Prisma JSON values back into objects for comparison.
    const oldValues =
      (log.oldValues as Record<string, unknown> | null) ?? {};

    const newValues =
      (log.newValues as Record<string, unknown> | null) ?? {};

    const changedFields: string[] = [];

    // Compare every field stored in newValues.
    for (const key of Object.keys(newValues)) {
      const label = FIELD_LABELS[key];

      // Skip fields that don't have a friendly label.
      if (!label) {
        continue;
      }

      const oldVal = oldValues[key];
      const newVal = newValues[key];

      // Only report fields whose values actually changed.
      if (String(oldVal ?? "0") !== String(newVal ?? "0")) {
        changedFields.push(
          `${label} from $${oldVal ?? "0"} to $${newVal ?? "0"}`
        );
      }
    }

    // If nothing meaningful changed, don't create a history item.
    if (changedFields.length === 0) {
      continue;
    }

    items.push({
      id: log.id,
      changedByName: log.changedBy.name,
      changedAt: log.changedAt,
      summary: `changed ${changedFields.join(", ")}`,
    });
  }

  return items;
}