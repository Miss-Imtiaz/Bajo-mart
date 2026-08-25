"use client";

import { useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { Card } from "@/components/ui/Card";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { saveDailyEntry, type DailyEntryFormData } from "@/actions/daily-entry.actions";
import { calculateDailyEntry } from "@/lib/calculations";
import type { Vendor } from "@prisma/client";

type VendorGroups = {
  OPERATING: Vendor[];
  WHOLESALE: Vendor[];
  SNACKS_BEVERAGE: Vendor[];
};

type Suggestions = Record<string, { bank: string[]; cash: string[] }>;

type ExistingEntry = {
  mopSale: unknown; eft: unknown; gasSale: unknown; gasInvoice: unknown; posFee: unknown;
  creCarFee: unknown; totalCard: unknown; stBalDiff: unknown; lottoTotal: unknown;
  lottoTicketSold: unknown; lottoCashActivation: unknown; lottoCommission: unknown; lottoRent: unknown;
  payCreditCard: unknown; payDebitCard: unknown; payMobil: unknown; payEbtCash: unknown;
  payCashInHand: unknown; payFs: unknown; storeSale: unknown; storeTax: unknown;
  storeCigTaxPaid: unknown; storeCDeposit: unknown; storeEDeposit: unknown; storeTDeposit: unknown;
  fuelGallons: { fuelType: string; gallons: unknown }[];
  expenses: { vendorId: string; bankAmount: unknown; cashAmount: unknown }[];
} | null;

function s(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

const emptyFields = {
  mopSale: "", eft: "", gasSale: "", gasInvoice: "", posFee: "", creCarFee: "",
  totalCard: "", stBalDiff: "",
  lottoTotal: "", lottoTicketSold: "", lottoCashActivation: "", lottoCommission: "", lottoRent: "",
  payCreditCard: "", payDebitCard: "", payMobil: "", payEbtCash: "", payCashInHand: "", payFs: "",
  storeSale: "", storeTax: "", storeCigTaxPaid: "", storeCDeposit: "", storeEDeposit: "", storeTDeposit: "",
};

const emptyGallons = { REGULAR: "", PLUS: "", PREMIUM: "", DIESEL: "" };

function Toast({ message, variant, onDismiss }: { message: string; variant: "success" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = variant === "success" ? "bg-confirm-600" : "bg-danger-600";

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4">
      <div className={`rounded px-4 py-3 text-sm text-white shadow-lg ${colors}`}>{message}</div>
    </div>
  );
}

export function DailyEntryForm({
  date, existingEntry, vendorGroups, suggestions,
}: {
  date: string; existingEntry: ExistingEntry; vendorGroups: VendorGroups; suggestions: Suggestions;
}) {
  const buildFieldsFromEntry = (entry: ExistingEntry) => {
    if (!entry) return emptyFields;
    return {
      mopSale: s(entry.mopSale), eft: s(entry.eft),
      gasSale: s(entry.gasSale), gasInvoice: s(entry.gasInvoice),
      posFee: s(entry.posFee), creCarFee: s(entry.creCarFee),
      totalCard: s(entry.totalCard), stBalDiff: s(entry.stBalDiff),
      lottoTotal: s(entry.lottoTotal), lottoTicketSold: s(entry.lottoTicketSold),
      lottoCashActivation: s(entry.lottoCashActivation), lottoCommission: s(entry.lottoCommission),
      lottoRent: s(entry.lottoRent),
      payCreditCard: s(entry.payCreditCard), payDebitCard: s(entry.payDebitCard),
      payMobil: s(entry.payMobil), payEbtCash: s(entry.payEbtCash),
      payCashInHand: s(entry.payCashInHand), payFs: s(entry.payFs),
      storeSale: s(entry.storeSale), storeTax: s(entry.storeTax),
      storeCigTaxPaid: s(entry.storeCigTaxPaid), storeCDeposit: s(entry.storeCDeposit),
      storeEDeposit: s(entry.storeEDeposit), storeTDeposit: s(entry.storeTDeposit),
    };
  };

  const [fields, setFields] = useState(() => buildFieldsFromEntry(existingEntry));

  const [gallons, setGallons] = useState(() => {
    const find = (type: string) => s(existingEntry?.fuelGallons.find((g) => g.fuelType === type)?.gallons);
    return { REGULAR: find("REGULAR"), PLUS: find("PLUS"), PREMIUM: find("PREMIUM"), DIESEL: find("DIESEL") };
  });

  const allVendors = [...vendorGroups.OPERATING, ...vendorGroups.WHOLESALE, ...vendorGroups.SNACKS_BEVERAGE];

  const buildExpensesFromEntry = (entry: ExistingEntry) => {
    const map: Record<string, { bank: string; cash: string }> = {};
    for (const v of allVendors) {
      const existing = entry?.expenses.find((e) => e.vendorId === v.id);
      map[v.id] = { bank: s(existing?.bankAmount), cash: s(existing?.cashAmount) };
    }
    return map;
  };

  const [expenses, setExpenses] = useState<Record<string, { bank: string; cash: string }>>(() =>
    buildExpensesFromEntry(existingEntry)
  );

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  function setField(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }
  function setGallon(type: keyof typeof gallons, value: string) {
    setGallons((g) => ({ ...g, [type]: value }));
  }
  function setExpense(vendorId: string, kind: "bank" | "cash", value: string) {
    setExpenses((e) => ({ ...e, [vendorId]: { ...e[vendorId], [kind]: value } }));
  }

  const liveCalc = useMemo(() => {
    const d = (v: string) => new Decimal(v || 0);
    return calculateDailyEntry({
      gallons: {
        regular: d(gallons.REGULAR), plus: d(gallons.PLUS),
        premium: d(gallons.PREMIUM), diesel: d(gallons.DIESEL),
      },
      expenseRows: Object.values(expenses).map((e) => ({ bankAmount: d(e.bank), cashAmount: d(e.cash) })),
    });
  }, [gallons, expenses]);

  async function handleSave() {
    setSaving(true);
    setToast(null);

    const data: DailyEntryFormData = {
      entryDate: date,
      ...fields,
      gallons,
      expenses: allVendors.map((v) => ({
        vendorId: v.id,
        bankAmount: expenses[v.id]?.bank ?? "0",
        cashAmount: expenses[v.id]?.cash ?? "0",
      })),
    };

    const result = await saveDailyEntry(data);
    setSaving(false);

    if (!result.success) {
      setToast({ message: result.error ?? "Not saved. Check your connection and try again.", variant: "error" });
      return;
    }

    setToast({ message: "Saved successfully.", variant: "success" });
    setFields(emptyFields);
    setGallons(emptyGallons);
    setExpenses(buildExpensesFromEntry(null));
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      <Card title="Gas Gallons">
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          {(["REGULAR", "PLUS", "PREMIUM", "DIESEL"] as const).map((type) => (
            <MoneyInput
              key={type}
              label={`${type.charAt(0)}${type.slice(1).toLowerCase()}`}
              value={gallons[type]}
              onChange={(e) => setGallon(type, e.target.value)}
            />
          ))}
        </div>
        <div className="text-sm text-ink-700">
          Total Gallons: <span className="font-mono text-ink-900">{liveCalc.totalGallons.toString()}</span>
        </div>
      </Card>

      <Card title="Sale & Purchase">
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          <MoneyInput label="Gas Sale" value={fields.gasSale} onChange={(e) => setField("gasSale", e.target.value)} />
          <MoneyInput label="Gas Invoice" value={fields.gasInvoice} onChange={(e) => setField("gasInvoice", e.target.value)} />
          <MoneyInput label="POS Fee" value={fields.posFee} onChange={(e) => setField("posFee", e.target.value)} />
          <MoneyInput label="Cre Car Fee" value={fields.creCarFee} onChange={(e) => setField("creCarFee", e.target.value)} />
          <MoneyInput label="Total Card" value={fields.totalCard} onChange={(e) => setField("totalCard", e.target.value)} />
          <MoneyInput label="ST/Bal Diff" value={fields.stBalDiff} onChange={(e) => setField("stBalDiff", e.target.value)} />
        </div>
      </Card>

      <Card title="Lotto">
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          <MoneyInput label="Total" value={fields.lottoTotal} onChange={(e) => setField("lottoTotal", e.target.value)} />
          <MoneyInput label="Ticket Sold" value={fields.lottoTicketSold} onChange={(e) => setField("lottoTicketSold", e.target.value)} />
          <MoneyInput label="Cash Activation" value={fields.lottoCashActivation} onChange={(e) => setField("lottoCashActivation", e.target.value)} />
          <MoneyInput label="Commission" value={fields.lottoCommission} onChange={(e) => setField("lottoCommission", e.target.value)} />
          <MoneyInput label="Rent" value={fields.lottoRent} onChange={(e) => setField("lottoRent", e.target.value)} />
        </div>
      </Card>

      <Card title="Payment">
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          <MoneyInput label="Credit Card" value={fields.payCreditCard} onChange={(e) => setField("payCreditCard", e.target.value)} />
          <MoneyInput label="Debit Card" value={fields.payDebitCard} onChange={(e) => setField("payDebitCard", e.target.value)} />
          <MoneyInput label="Mobil" value={fields.payMobil} onChange={(e) => setField("payMobil", e.target.value)} />
          <MoneyInput label="EBT Cash" value={fields.payEbtCash} onChange={(e) => setField("payEbtCash", e.target.value)} />
          <MoneyInput label="Cash In Hand" value={fields.payCashInHand} onChange={(e) => setField("payCashInHand", e.target.value)} />
          <MoneyInput label="FS" value={fields.payFs} onChange={(e) => setField("payFs", e.target.value)} />
        </div>
        <MoneyInput label="MOP Sale" value={fields.mopSale} onChange={(e) => setField("mopSale", e.target.value)} />
        <MoneyInput label="EFT" value={fields.eft} onChange={(e) => setField("eft", e.target.value)} />
      </Card>

      <Card title="Store">
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          <MoneyInput label="Store Sale" value={fields.storeSale} onChange={(e) => setField("storeSale", e.target.value)} />
          <MoneyInput label="Tax" value={fields.storeTax} onChange={(e) => setField("storeTax", e.target.value)} />
          <MoneyInput label="Cig Tax Paid" value={fields.storeCigTaxPaid} onChange={(e) => setField("storeCigTaxPaid", e.target.value)} />
          <MoneyInput label="C. Deposit" value={fields.storeCDeposit} onChange={(e) => setField("storeCDeposit", e.target.value)} />
          <MoneyInput label="E. Deposit" value={fields.storeEDeposit} onChange={(e) => setField("storeEDeposit", e.target.value)} />
          <MoneyInput label="T. Deposit" value={fields.storeTDeposit} onChange={(e) => setField("storeTDeposit", e.target.value)} />
        </div>
      </Card>

      {(["OPERATING", "WHOLESALE", "SNACKS_BEVERAGE"] as const).map((groupKey) => {
        const label =
          groupKey === "OPERATING" ? "Operating Expenses" :
          groupKey === "WHOLESALE" ? "Wholesale Expenses" : "Snacks / Beverage Expenses";
        return (
          <Card key={groupKey} title={label}>
            <div className="flex flex-col divide-y divide-line-200">
              {vendorGroups[groupKey].filter((v) => v.isActive).map((vendor) => {
                const vendorSuggestions = suggestions[vendor.id];
                const bankListId = `suggest-bank-${vendor.id}`;
                const cashListId = `suggest-cash-${vendor.id}`;
                return (
                  <div
                    key={vendor.id}
                    className="flex flex-col gap-2 py-2 tablet:grid tablet:grid-cols-[1fr_140px_140px] tablet:items-center tablet:gap-2"
                  >
                    <span className="text-sm text-ink-900">{vendor.name}</span>
                    <div className="grid grid-cols-2 gap-2 tablet:contents">
                      <MoneyInput
                        label="Bank"
                        value={expenses[vendor.id]?.bank ?? ""}
                        onChange={(e) => setExpense(vendor.id, "bank", e.target.value)}
                        list={bankListId}
                      />
                      <MoneyInput
                        label="Cash"
                        value={expenses[vendor.id]?.cash ?? ""}
                        onChange={(e) => setExpense(vendor.id, "cash", e.target.value)}
                        list={cashListId}
                      />
                    </div>
                    {vendorSuggestions?.bank.length ? (
                      <datalist id={bankListId}>
                        {vendorSuggestions.bank.map((amt) => <option key={amt} value={amt} />)}
                      </datalist>
                    ) : null}
                    {vendorSuggestions?.cash.length ? (
                      <datalist id={cashListId}>
                        {vendorSuggestions.cash.map((amt) => <option key={amt} value={amt} />)}
                      </datalist>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <Card title="Totals">
        <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
          <div className="flex justify-between tablet:flex-col tablet:gap-1">
            <span className="text-sm text-ink-700">Total Bank Expense</span>
            <span className="font-mono text-lg text-ink-900">${liveCalc.totalBankExpense.toString()}</span>
          </div>
          <div className="flex justify-between tablet:flex-col tablet:gap-1">
            <span className="text-sm text-ink-700">Total Cash Expense</span>
            <span className="font-mono text-lg text-ink-900">${liveCalc.totalCashExpense.toString()}</span>
          </div>
          <div className="flex justify-between tablet:flex-col tablet:gap-1">
            <span className="text-sm font-semibold text-ink-700">Total Expense</span>
            <span className="font-mono text-xl text-ink-900">${liveCalc.totalExpense.toString()}</span>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line-200 bg-paper-0 px-4 py-4">
        <Button onClick={handleSave} disabled={saving} className="w-full tablet:w-auto">
          {saving ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}
