"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { AuditHistoryItem } from "@/actions/audit.actions";

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function AuditHistory({ items }: { items: AuditHistoryItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card title="History">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-left text-sm text-petrol-600">
        {open ? "Hide" : "Show"} {items.length} change{items.length === 1 ? "" : "s"} to this day
      </button>

      {open && (
        <ul className="flex flex-col gap-3 border-t border-line-200 pt-3">
          {items.map((item) => (
            <li key={item.id} className="text-sm text-ink-700">
              <span className="font-semibold text-ink-900">{item.changedByName}</span> {item.summary}
              <div className="text-xs text-ink-400">{formatDateTime(item.changedAt)}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
