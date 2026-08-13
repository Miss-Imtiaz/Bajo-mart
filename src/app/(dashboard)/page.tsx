import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { todayDateString, parseDateOnly } from "@/lib/dates";

export default async function DashboardHome() {
  const todayStr = todayDateString();

  const todaysEntry = await prisma.dailyEntry.findUnique({
    where: { entryDate: parseDateOnly(todayStr) },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card title="Today">
        {todaysEntry ? (
          <div className="flex items-center justify-between">
            <p className="text-ink-700">
              Today's entry is saved. Total Expense:{" "}
              <span className="font-mono text-ink-900">${todaysEntry.totalExpense.toString()}</span>
            </p>
            <a href={`/daily-entry/${todayStr}`}>
              <Button variant="secondary">Edit Today's Entry</Button>
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-ink-700">No entry for today yet.</p>
            <a href={`/daily-entry/${todayStr}`}>
              <Button>Start Today's Entry</Button>
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}