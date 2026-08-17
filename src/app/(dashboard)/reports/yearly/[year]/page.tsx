import { getYearlyReport } from "@/actions/report.actions";
import { Card } from "@/components/ui/Card";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const GROUP_LABELS: Record<string, string> = {
  OPERATING: "Operating Expenses",
  WHOLESALE: "Wholesale Expenses",
  SNACKS_BEVERAGE: "Snacks / Beverage",
};

export default async function YearlyReportPage({ params }: { params: { year: string } }) {
  const year = parseInt(params.year, 10);
  const report = await getYearlyReport(year);

  const maxExpense = Math.max(
    1,
    ...report.monthlyTrend.map((m) => Number(m.totalExpense.toString()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">{year} — Yearly Report</h1>
        <div className="flex gap-2">
          <a
            href={`/reports/yearly/${year - 1}`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-ink-700"
          >
            ← {year - 1}
          </a>
          <a
            href={`/reports/yearly/${year + 1}`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-ink-700"
          >
            {year + 1} →
          </a>
          <a
            href={`/reports/monthly/${year}/${new Date().getMonth() + 1}`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-petrol-600"
          >
            View Monthly Report
          </a>
          <a
            href={`/api/export/yearly/${year}/excel`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-petrol-600"
          >
            Download Excel
          </a>
          <a
            href={`/api/export/yearly/${year}/pdf`}
            className="rounded border border-line-200 bg-paper-0 px-3 py-2 text-sm text-petrol-600"
          >
            Download PDF
          </a>
        </div>
      </div>

      {report.daysWithEntries === 0 ? (
        <p className="text-sm text-ink-700">No entries found for this year yet.</p>
      ) : (
        <p className="text-sm text-ink-700">{report.daysWithEntries} day(s) recorded this year.</p>
      )}

      <Card title="Month-by-Month Trend — Total Expense">
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {report.monthlyTrend.map((m) => {
            const value = Number(m.totalExpense.toString());
            const heightPct = m.daysWithEntries > 0 ? Math.max(4, (value / maxExpense) * 100) : 0;
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs text-ink-700">
                  {value > 0 ? `$${value.toFixed(0)}` : ""}
                </span>
                <div
                  className={`w-full rounded-t ${m.daysWithEntries > 0 ? "bg-petrol-600" : "bg-line-200"}`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-xs text-ink-400">{MONTH_NAMES[m.month - 1]}</span>
              </div>
            );
          })}
        </div>
      </Card>

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

      <Card title="Vendor Expenses (Full Year)">
        {report.vendorRows.length === 0 ? (
          <p className="text-sm text-ink-400">No expenses recorded this year.</p>
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
