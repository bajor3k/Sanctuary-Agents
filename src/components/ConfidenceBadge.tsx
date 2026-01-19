"use client";

type Props = { value?: number | null };

function normalize(val?: number | null) {
  if (val === null || val === undefined || Number.isNaN(val)) return null;
  // Accept 0..1 or 0..100
  return val <= 1 ? Math.max(0, Math.min(1, val)) * 100 : Math.max(0, Math.min(100, val));
}

function tier(n: number) {
  if (n >= 85) return { label: "High",  color: "text-emerald-400", bar: "bg-emerald-500/70" };
  if (n >= 60) return { label: "Medium", color: "text-amber-400",   bar: "bg-amber-500/70" };
  return           { label: "Low",   color: "text-rose-400",    bar: "bg-rose-500/70" };
}

export default function ConfidenceBadge({ value }: Props) {
  const pct = normalize(value);
  if (pct === null) return null;

  const { label, color, bar } = tier(pct);

  return (
    <div
      className="select-none pointer-events-none"
      aria-label={`Confidence ${label} ${Math.round(pct)} percent`}
      role="status"
    >
      <div className="flex items-center gap-2 justify-end">
        <span className={`text-xs font-medium ${color}`}>Confidence: {label} ({Math.round(pct)}%)</span>
      </div>
      <div className="mt-1 h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full ${bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
