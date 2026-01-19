// src/components/reports/ReportsDashboard.types.ts
export type Kpi = { label: string; value: string };

export type DonutSlice = {
  name: string;   // e.g., "XYZ"
  value: number;  // number for the slice (sum or %)
};

export type TableRow = {
  ip: string;
  acct: string;     // account number
  value: string;    // formatted currency
  fee: string;      // formatted currency
  cash: string;     // formatted currency
  short: boolean;   // status -> red chip if true
};

export type ReportsDashboardProps = {
  metrics: {
    totalAdvisoryFees: string;
    totalAccounts: number;
    flaggedShort: number;
  };
  tableRows: TableRow[];
  onAsk?: (q: string) => void;
};
