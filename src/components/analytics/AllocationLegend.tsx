
import React from "react";

type LegendItem = {
  label: string;
  value?: string;  // e.g. "40%"
  color: string;   // CSS color token (e.g., "var(--palette-1)")
};

export function AllocationLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-4 rounded-md"
        >
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-lg text-muted-foreground truncate" title={item.label}>{item.label}</span>
          </div>
          {item.value && (
            <span className="text-lg font-semibold text-foreground">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
