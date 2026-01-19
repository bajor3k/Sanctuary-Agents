// components/reports/ResultsTableCard.tsx
import React from "react";

export type TableRow = {
  ip: string;
  acct: string;
  value: string;
  fee: string;
  cash: string;
  short: boolean;
};

function StatusPill({ short }: { short: boolean }) {
  if (!short) return <>—</>;
  return (
    <span
      className="
        inline-flex items-center rounded-full px-2 py-[2px] text-xs font-medium
        text-destructive
        bg-destructive/10
        border border-destructive/20
      "
    >
      Short
    </span>
  );
}

const ResultsTableCard = React.forwardRef<HTMLTableElement, { title?: string; rows: TableRow[] }>(
  ({ title = "Results", rows }, ref) => {
    return (
      <section className="report-pane relative z-10 rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 overflow-hidden flex flex-col">
        <div className="text-sm font-semibold opacity-80">{title}</div>
        <div className="mt-3 flex-1 report-scroll scroll-invisible">
          <table ref={ref} className="report-table w-full text-sm">
            {/* Header */}
            <thead
            className="
                sticky top-0 z-10
                bg-card
                text-muted-foreground
                border-b border-border
            "
            >
            <tr>
                <th className="py-2.5 pr-4 pl-2 text-left font-semibold">IP</th>
                <th className="py-2.5 pr-4 text-left font-semibold">Account Number</th>
                <th className="py-2.5 pr-4 text-left font-semibold">Value</th>
                <th className="py-2.5 pr-4 text-left font-semibold">Advisory Fees</th>
                <th className="py-2.5 pr-4 text-left font-semibold">Cash</th>
                <th className="py-2.5 text-left font-semibold">Status</th>
            </tr>
            </thead>

            <tbody>
            {rows.length === 0 ? (
                <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No rows to display. Run the report to populate results.
                </td>
                </tr>
            ) : (
                rows.map((r, i) => (
                <tr
                    key={i}
                    className="
                    border-b border-border last:border-0
                    hover:bg-muted/50
                    "
                >
                    <td className="py-2 pr-4 pl-2 text-foreground">{r.ip}</td>
                    <td className="py-2 pr-4 text-foreground">{r.acct}</td>
                    <td className="py-2 pr-4 text-foreground">{r.value}</td>
                    <td className="py-2 pr-4 text-foreground">{r.fee}</td>
                    <td className="py-2 pr-4 text-foreground">{r.cash}</td>
                    <td className="py-2 text-foreground">
                    <StatusPill short={r.short} />
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>
      </section>
    );
  }
);
ResultsTableCard.displayName = 'ResultsTableCard';

export default ResultsTableCard;
