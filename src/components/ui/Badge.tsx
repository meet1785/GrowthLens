import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    success: "bg-[var(--success-dim)] text-[var(--success)] border-emerald-300/20",
    warning: "bg-[var(--warning-dim)] text-[var(--warning)] border-amber-300/20",
    error: "bg-[var(--error-dim)] text-[var(--error)] border-rose-300/20",
    info: "bg-[var(--info-dim)] text-[var(--info)] border-blue-300/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border font-mono",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
