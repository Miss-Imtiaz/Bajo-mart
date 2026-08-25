import { ReactNode } from "react";

interface CardProps {
  title: string;
  totalLabel?: string;
  children: ReactNode;
}

export function Card({ title, totalLabel, children }: CardProps) {
  return (
    <div className="rounded-card border border-line-200 bg-paper-0 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {totalLabel && <span className="font-mono text-lg text-ink-900">{totalLabel}</span>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
