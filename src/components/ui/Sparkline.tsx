"use client";

import React from "react";

interface SparklineProps {
  /** Array of score values (0-100). At least 2 points needed. */
  data: number[];
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  /** Stroke color */
  color?: string;
  /** Show area fill */
  fill?: boolean;
  /** Show the last value dot */
  showDot?: boolean;
  /** Label for accessibility */
  label?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = "var(--accent)",
  fill = true,
  showDot = true,
  label = "Score trend",
}: SparklineProps) {
  if (data.length < 2) return null;

  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const min = Math.min(...data, 0);
  const max = Math.max(...data, 100);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: padding + (i / (data.length - 1)) * innerW,
    y: padding + innerH - ((value - min) / range) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const lastPoint = points[points.length - 1];
  const lastValue = data[data.length - 1];
  const prevValue = data[data.length - 2];
  const trend = lastValue - prevValue;

  return (
    <div className="inline-flex items-center gap-2" title={`${label}: ${data.join(" → ")}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={label}
      >
        {fill && (
          <path
            d={areaPath}
            fill={color}
            fillOpacity={0.1}
          />
        )}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDot && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
            fill={color}
            stroke="var(--bg-deep)"
            strokeWidth={1}
          />
        )}
      </svg>
      {trend !== 0 && (
        <span
          className={`text-[10px] font-mono font-semibold ${
            trend > 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend > 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
  );
}
