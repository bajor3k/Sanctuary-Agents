
"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { BarBlock, LineBlock, AreaBlock } from "@/components/metrics/PastelCharts";

// Helper to safely parse string to number
const num = (v: any): number => {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/[, $]/g,''));
    return isFinite(n) ? n : 0;
  }

// Main Component
export default function KeyMetricsPanel({ rows }: { rows: any[] }) {
  const metrics = useMemo(() => {
    const totalFees = rows.reduce((acc, r) => acc + num(r.fee), 0);
    const shortRows = rows.filter(r => r.short);
    
    return {
      totalFees,
      totalAccounts: rows.length,
      flaggedShort: shortRows.length,
      shortRows: shortRows.map(r => ({
          accountNumber: r.acct,
          ip: r.ip,
          cash: r.cash,
      }))
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Advisory Fees"
          value={formatCurrency(metrics.totalFees)}
          subtitle="Sum of all fees from report"
        />
        <KpiCard
          title="Accounts"
          value={metrics.totalAccounts}
          subtitle="Total accounts in the report"
        />
        <KpiCard
          title="Flagged Short"
          value={metrics.flaggedShort}
          subtitle="Accounts with cash < fees"
          tone="alert"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <BarBlock />
        <LineBlock />
        <AreaBlock />
      </div>


      <div className="report-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-slate-300">Accounts Flagged Short</h3>
            <Badge className="bg-rose-600/20 text-rose-300">{metrics.shortRows.length}</Badge>
          </div>
          {metrics.shortRows.length === 0 ? (
            <div className="text-slate-400 text-sm">No accounts are currently flagged as <span className="text-slate-200">Short</span>.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {metrics.shortRows.slice(0, 12).map((r, i) => (
                <div key={r.accountNumber} className="rounded-lg border border-white/10 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{r.ip}</p>
                      <p className="text-zinc-400 text-sm">{r.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-sm">Cash</p>
                      <p className="text-white font-bold">{r.cash}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}


function KpiCard({ title, value, subtitle, tone = "default" }: { title: string, value: string | number, subtitle: string, tone?: "default" | "alert" }) {
  return (
    <div className="report-card rounded-2xl p-5 flex items-start justify-between">
      <div>
        <p className="text-base font-semibold text-zinc-300">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      </div>

      <div className="text-right">
        <div className="text-4xl font-bold tracking-tight text-white">{value}</div>
      </div>
    </div>
  );
}


function formatCurrency(n: any) {
  return n?.toLocaleString?.("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) ?? "$0";
}


function avg(arr: any[]) {
  if (!arr?.length) return 0;
  return arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length;
}
