import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = "md",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-mono font-medium text-amber-500">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 to-amber-400",
            sizes[size],
            clamped >= 90 && "from-green-500 to-emerald-400",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
