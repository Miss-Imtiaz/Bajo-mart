import { InputHTMLAttributes, forwardRef } from "react";

interface MoneyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm text-ink-700">
          {label}
        </label>
        <div
          className={`flex items-center rounded border bg-paper-0 px-3 ${
            error ? "border-danger-600 border-2" : "border-line-200"
          } focus-within:border-petrol-600 focus-within:border-2`}
        >
          <span className="text-ink-400 select-none">$</span>
          <input
            ref={ref}
            id={inputId}
            type="number"
            step="0.01"
            inputMode="decimal"
            className={`w-full min-w-0 bg-transparent py-3 pl-1 text-right font-mono text-base outline-none ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger-600">{error}</span>}
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";
