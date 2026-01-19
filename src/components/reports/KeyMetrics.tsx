
import React from "react";
import MetricStat from "./MetricStat";

export default function KeyMetrics({
  totalFees,
  totalAccounts,
  flaggedShort,
  totalRows,
}: {
  totalFees: string;      // e.g. "$2,123.00"
  totalAccounts: number;  // e.g. 24
  flaggedShort: number;   // e.g. 9
  totalRows: number;      // e.g. 24
}) {
  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <MetricStat label="Total Advisory Fees" value={totalFees} testId="kpi-fees" />
      <MetricStat label="Total Accounts" value={totalAccounts} testId="kpi-accounts" />
      <MetricStat label="Flagged Short" value={flaggedShort} testId="kpi-short" />
      <MetricStat label="Total Rows" value={totalRows} testId="kpi-rows" />
    </section>
  );
}
