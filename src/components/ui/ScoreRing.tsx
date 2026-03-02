import React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreRing({
  score,
  label,
  size = "md",
  className,
}: ScoreRingProps) {
  const sizes = {
    sm: { container: "w-20 h-20", text: "text-lg", label: "text-xs", r: 30, stroke: 5 },
    md: { container: "w-28 h-28", text: "text-2xl", label: "text-xs", r: 42, stroke: 6 },
    lg: { container: "w-36 h-36", text: "text-3xl", label: "text-sm", r: 54, stroke: 7 },
  };

  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = (v: number) => {
    if (v >= 80) return "stroke-emerald-400";
    if (v >= 60) return "stroke-amber-400";
    if (v >= 40) return "stroke-orange-400";
    return "stroke-red-400";
  };

  const getTextColor = (v: number) => {
    if (v >= 80) return "text-emerald-400";
    if (v >= 60) return "text-amber-400";
    if (v >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className={cn("relative", s.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={s.r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={s.stroke}
          />
          {/* Score arc */}
          <circle
            cx="60"
            cy="60"
            r={s.r}
            fill="none"
            className={getStrokeColor(score)}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-mono font-bold", s.text, getTextColor(score))}>
            {score}
          </span>
        </div>
      </div>
      <span className={cn("font-medium text-[var(--text-muted)]", s.label)}>
        {label}
      </span>
    </div>
  );
}
