import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "destructive" | "disabled";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-petrol-600 hover:bg-petrol-700 text-white",
  secondary: "bg-paper-0 text-petrol-600 border border-line-200",
  destructive: "bg-paper-0 text-danger-600 border border-danger-600",
  disabled: "bg-line-200 text-ink-400 cursor-not-allowed",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", disabled, ...props }, ref) => {
    const resolvedVariant = disabled ? "disabled" : variant;
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`rounded px-5 py-3 text-base font-medium transition-colors ${variantClasses[resolvedVariant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
