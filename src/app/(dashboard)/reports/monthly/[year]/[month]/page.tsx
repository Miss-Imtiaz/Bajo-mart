import { getMonthlyReport } from "@/actions/report.actions";
import { Card } from "@/components/ui/Card";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GROUP_LABELS: Record<string, string> = {
  OPERATING: "Operating Expenses",
  WHOLESALE: "Wholesale Expenses",
  SNACKS_BEVERAGE: "Snacks / Beverage",
};

export default async function MonthlyReportPage({
  params,
}: {
  params: { year: string; month: string };
}) {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);
  const report = await getMonthlyReport(year, month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink-900">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/reports/monthly/${prevYear}/${prevMonth}`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-ink-700"
          >
            ← Previous
          </a>
          <a
            href={`/reports/monthly/${nextYear}/${nextMonth}`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-ink-700"
          >
            Next →
          </a>
          <a
            href={`/api/export/monthly/${year}/${month}/excel`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-petrol-600"
          >
            Download Excel
          </a>
          <a
            href={`/api/export/monthly/${year}/${month}/pdf`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-petrol-600"
          >
            Download PDF
          </a>
        </div>
      </div>

      {report.daysWithEntries === 0 ? (
        <p className="text-sm text-ink-700">No entries found for this month yet.</p>
      ) : (
        <p className="text-sm text-ink-700">{report.daysWithEntries} day(s) recorded this month.</p>
      )}

      <Card title="Section Totals">
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3">
          <TotalItem label="Gas Sale" value={report.totals.gasSale} />
          <TotalItem label="Total Card" value={report.totals.totalCard} />
          <TotalItem label="Lotto Total" value={report.totals.lottoTotal} />
          <TotalItem label="Lotto Commission" value={report.totals.lottoCommission} />
          <TotalItem label="Store Sale" value={report.totals.storeSale} />
          <TotalItem label="Store Tax" value={report.totals.storeTax} />
          <TotalItem label="Credit Card" value={report.totals.payCreditCard} />
          <TotalItem label="Cash In Hand" value={report.totals.payCashInHand} />
        </div>
      </Card>

      <Card title="Vendor Expenses">
        {report.vendorRows.length === 0 ? (
          <p className="text-sm text-ink-400">No expenses recorded this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-paper-100">
                <tr className="text-left text-ink-700">
                  <th className="py-2">Vendor</th>
                  <th className="py-2">Group</th>
                  <th className="py-2 text-right">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-confirm-600" />
                    Bank
                  </th>
                  <th className="py-2 text-right">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
                    Cash
                  </th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {report.vendorRows
                  .sort((a, b) => b.total.comparedTo(a.total))
                  .map((row) => (
                    <tr key={row.vendorId}>
                      <td className="py-2 text-ink-900">{row.name}</td>
                      <td className="py-2 text-ink-400">{GROUP_LABELS[row.group]}</td>
                      <td className="py-2 text-right font-mono text-ink-900">${row.bank.toString()}</td>
                      <td className="py-2 text-right font-mono text-ink-900">${row.cash.toString()}</td>
                      <td className="py-2 text-right font-mono font-semibold text-ink-900">
                        ${row.total.toString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line-200 bg-paper-100 px-4 pb-4 pt-3">
        <Card title="Expense & Net Summary">
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
            <TotalItem label="Total Bank Expense" value={report.totals.totalBankExpense} />
            <TotalItem label="Total Cash Expense" value={report.totals.totalCashExpense} />
            <TotalItem label="Total Expense" value={report.totals.totalExpense} emphasize />
          </div>
        </Card>
      </div>
    </div>
  );
}

function TotalItem({ label, value, emphasize }: { label: string; value: { toString(): string }; emphasize?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink-700">{label}</span>
      <span className={`font-mono ${emphasize ? "text-xl" : "text-lg"} text-ink-900`}>
        ${value.toString()}
      </span>
    </div>
  );
}
