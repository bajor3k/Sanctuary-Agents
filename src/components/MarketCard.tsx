// components/MarketCard.tsx
import { cn } from "@/lib/utils";

type MarketCardProps = {
  label: string;
  price?: number;
  changePct?: number;
  isLoading?: boolean;
};

export default function MarketCard({ label, price, changePct, isLoading }: MarketCardProps) {
  const up = (changePct ?? 0) >= 0;

  return (
    <div className="rounded-2xl bg-[var(--surface-card)] text-card-foreground p-4 border border-[var(--card-border-subtle)] shadow-none">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT: name/ticker + change */}
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground truncate">{label}</div>
          <div
            className={cn(
              "text-xs mt-1 font-semibold",
              changePct == null ? "text-muted-foreground" : up ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isLoading || changePct == null ? "—" : `${up ? "↑" : "↓"} ${Math.abs(changePct).toFixed(2)}%`}
          </div>
        </div>

        {/* RIGHT: price */}
        <div className="shrink-0 text-right">
          <div className="text-2xl leading-none font-bold tracking-tight">
            {isLoading || price == null ? "Loading..." : `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>
      </div>
    </div>
  );
}
