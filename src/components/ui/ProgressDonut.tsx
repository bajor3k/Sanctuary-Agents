import * as React from "react";
import clsx from "clsx";

type ProgressDonutProps = {
  percent: number;          // 0–100
  size?: number;            // px, default 40
  strokeWidth?: number;     // px, default 6
  className?: string;
  showLabel?: boolean;      // default true
};

export default function ProgressDonut({
  percent,
  size = 40,
  strokeWidth = 6,
  className,
  showLabel = true,
}: ProgressDonutProps) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - clamped / 100);

  // Scale label so it always fits; keeps a consistent (non-bold) weight
  const fontSize = Math.max(10, Math.round(size * 0.32)); // ~32% of size

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center",
        "select-none",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={`Progress ${clamped}%`}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"  // subtle track for dark mode
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          // Start from top (12 o'clock)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="text-white/80"
        />
      </svg>

      {showLabel && (
        <span
          className="absolute leading-none font-medium tracking-tight text-white/90"
          style={{ fontSize }}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
