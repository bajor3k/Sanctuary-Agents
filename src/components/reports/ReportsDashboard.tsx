
// src/components/reports/ReportsDashboard.tsx
import KeyMetrics from "@/components/reports/KeyMetrics";

type Props = {
  metrics: {
    totalAdvisoryFees: number;
    totalAccounts: number;
    flaggedShort: number;
    totalRows: number;
  };
};

function formatCurrency(n: number) {
    return n.toLocaleString('en-US', { style: "currency", currency: "USD" });
}
  
function formatInt(n: number) {
    return n.toLocaleString();
}

export default function ReportsDashboard({
  metrics,
}: Props) {
  return (
    <div
      className="
        w-full max-w-none
        grid gap-4 md:gap-6 items-stretch
        grid-cols-1
      "
    >
      <KeyMetrics
        totalFees={formatCurrency(metrics.totalAdvisoryFees)}
        totalAccounts={metrics.totalAccounts}
        flaggedShort={metrics.flaggedShort}
        totalRows={metrics.totalRows}
      />
    </div>
  );
}
