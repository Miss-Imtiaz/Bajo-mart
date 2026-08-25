import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DonutChart } from "@/components/ui/DonutChart";
import { todayDateString, parseDateOnly } from "@/lib/dates";
import { getMonthlyReport } from "@/actions/report.actions";

const GROUP_COLORS: Record<string, string> = {
  OPERATING: "#1E4258",
  WHOLESALE: "#D98E2C",
  SNACKS_BEVERAGE: "#2E7D5B",
};

const GROUP_LABELS: Record<string, string> = {
  OPERATING: "Operating",
  WHOLESALE: "Wholesale",
  SNACKS_BEVERAGE: "Snacks / Beverage",
};

export default async function DashboardHome() {
  const todayStr = todayDateString();
  const now = new Date();

  const [todaysEntry, monthlyReport] = await Promise.all([
    prisma.dailyEntry.findUnique({ where: { entryDate: parseDateOnly(todayStr) } }),
    getMonthlyReport(now.getFullYear(), now.getMonth() + 1),
  ]);

  const groupTotals: Record<string, number> = { OPERATING: 0, WHOLESALE: 0, SNACKS_BEVERAGE: 0 };
  for (const row of monthlyReport.vendorRows) {
    groupTotals[row.group] = (groupTotals[row.group] ?? 0) + Number(row.total.toString());
  }

  const chartSegments = (["OPERATING", "WHOLESALE", "SNACKS_BEVERAGE"] as const).map((g) => ({
    label: GROUP_LABELS[g],
    value: groupTotals[g],
    color: GROUP_COLORS[g],
  }));

  const monthName = now.toLocaleString("en-US", { month: "long" });

  return (
    <div className="flex flex-col gap-4">
      <Card title="Today">
        {todaysEntry ? (
          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="text-ink-700">
              Today's entry is saved. Total Expense:{" "}
              <span className="font-mono text-ink-900">${todaysEntry.totalExpense.toString()}</span>
            </p>
            <a href={`/daily-entry/${todayStr}`}>
              <Button variant="secondary">Edit Today's Entry</Button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="text-ink-700">No entry for today yet.</p>
            <a href={`/daily-entry/${todayStr}`}>
              <Button>Start Today's Entry</Button>
            </a>
          </div>
        )}
      </Card>

      <Card title={`${monthName} — This Month So Far`}>
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          <StatItem label="Store Sale" value={monthlyReport.totals.storeSale.toString()} />
          <StatItem label="Total Bank Expense" value={monthlyReport.totals.totalBankExpense.toString()} />
          <StatItem label="Total Cash Expense" value={monthlyReport.totals.totalCashExpense.toString()} />
          <StatItem label="Total Expense" value={monthlyReport.totals.totalExpense.toString()} emphasize />
        </div>
      </Card>

      <Card title="Expense Breakdown by Category">
        {monthlyReport.vendorRows.length === 0 ? (
          <p className="text-sm text-ink-400">No vendor expenses recorded yet this month.</p>
        ) : (
          <DonutChart segments={chartSegments} size={130} />
        )}
      </Card>
    </div>
  );
}

function StatItem({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink-700">{label}</span>
      <span className={`font-mono ${emphasize ? "text-xl" : "text-lg"} text-ink-900 break-all`}>${value}</span>
    </div>
  );
}
