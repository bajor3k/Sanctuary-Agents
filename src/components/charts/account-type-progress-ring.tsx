
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccountTypeProgressRingProps {
  progress: number; // 0-100
  accountType: 'Traditional IRA' | 'Roth IRA' | 'SEP IRA' | 'SIMPLE IRA';
  size?: number; // diameter in pixels
  strokeWidth?: number; // width of the ring stroke
  className?: string;
}

const accountTypeRingColors: Record<'Traditional IRA' | 'Roth IRA' | 'SEP IRA' | 'SIMPLE IRA', string> = {
  'Traditional IRA': "stroke-[hsl(var(--chart-1))]", // Primary Accent - Purple
  'Roth IRA': "stroke-[hsl(var(--chart-2))]",        // Secondary Accent - Blue/Teal like
  'SEP IRA': "stroke-[hsl(var(--chart-3))]",         // Green
  'SIMPLE IRA': "stroke-[hsl(var(--chart-orange))]", // Orange
};

export function AccountTypeProgressRing({
  progress,
  accountType,
  size = 120, // Larger default size for these cards
  strokeWidth = 10,
  className,
}: AccountTypeProgressRingProps) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClass = accountTypeRingColors[accountType] || "stroke-[hsl(var(--muted))]";
  const glowFilter = progress > 90 ? "drop-shadow(0 0 4px hsl(var(--primary)))" : "none";

  return (
    <div
      className={cn("relative flex items-center justify-center my-4", className)}
      style={{ width: size, height: size }}
    >
      <svg
        height={size}
        width={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{ filter: glowFilter }}
      >
        <circle
          stroke="hsl(var(--muted)/0.3)" // Muted background ring
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(
            "transition-all duration-500 ease-in-out",
            colorClass
          )}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-foreground">
        {`${Math.round(progress)}%`}
      </span>
    </div>
  );
}
