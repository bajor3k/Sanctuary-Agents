
import React from "react";

type Props = {
  label: string;
  value: React.ReactNode;
  testId?: string;
};

export default function MetricStat({ label, value, testId }: Props) {
  return (
    <div
      data-testid={testId}
      className={[
        // container
        "min-w-0 rounded-2xl border px-4 py-3",
        // Light mode
        "bg-[#fcfbfb] border-black/10 text-black",
        // Dark mode
        "dark:bg-[#101010] dark:border-white/10 dark:text-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-[13px] font-medium text-black/70 dark:text-white/80">
          <span className="block truncate">{label}</span>
        </div>

        <div
          className={[
            "min-w-0 max-w-[60%] text-right font-semibold tabular-nums tracking-tight text-black dark:text-white",
            // responsive, never huge on narrow but scales a bit on wide
            "text-[clamp(18px,2.2vw,28px)]",
            "truncate",
          ].join(" ")}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
