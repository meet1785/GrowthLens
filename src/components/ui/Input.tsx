import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] transition-colors duration-200",
            "focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
