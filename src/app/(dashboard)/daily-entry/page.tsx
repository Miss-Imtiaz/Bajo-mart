"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { todayDateString } from "@/lib/dates";

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function DailyEntryPickerPage() {
  const router = useRouter();
  const today = todayDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  function goToDate(dateStr: string) {
    router.push(`/daily-entry/${dateStr}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-ink-900">Daily Entry</h1>

      <Card title="Pick a Day">
        <p className="text-sm text-ink-700">
          Choose any date to start a new entry or edit one that's already saved.
        </p>

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="entry-date" className="text-sm text-ink-700">
              Date
            </label>
            <input
              id="entry-date"
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
            />
          </div>
          <Button onClick={() => goToDate(selectedDate)}>Go to This Date</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => goToDate(today)}>
            Today
          </Button>
          <Button variant="secondary" onClick={() => goToDate(shiftDate(today, -1))}>
            Yesterday
          </Button>
          <Button variant="secondary" onClick={() => goToDate(shiftDate(today, -2))}>
            2 Days Ago
          </Button>
        </div>
      </Card>
    </div>
  );
}
