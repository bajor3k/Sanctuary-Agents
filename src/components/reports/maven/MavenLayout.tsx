
// components/reports/maven/MavenLayout.tsx
import * as React from "react";
import { MavenChat } from "./MavenChat";
import ResultsTableCard from "../ResultsTableCard";

type Row = {
    ip: string;
    acct: string;
    value: string;
    fee: string;
    cash: string;
    short: boolean;
};

export function MavenLayout({
  rows,
  onClose,
}: {
  rows: Row[];
  onClose: () => void;
}) {
  return (
    <section
      className="mt-2 h-[calc(100vh-100px)] flex gap-4"
    >
      {/* LEFT: data table area, now a flex child */}
      <div className="flex-1 min-w-0 h-full">
        <ResultsTableCard rows={rows} />
      </div>

      {/* RIGHT: Maven chat panel, now a flex child */}
      <div className="w-[clamp(360px,30vw,460px)] shrink-0 h-full">
        <MavenChat onClose={onClose} />
      </div>
    </section>
  );
}
