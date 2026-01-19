// @/components/analytics/InflowOutflowLines.tsx
"use client";
import * as React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Row = { date: string; account: string; inflow: number; outflow: number };

const fmt$ = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const largestBy = (rows: Row[], key: "inflow" | "outflow") => {
  const hits = rows.filter(r => (r[key] || 0) > 0);
  if (!hits.length) return { account: "N/A", amount: 0 };
  const top = hits.reduce((m, r) => (r[key] > (m[key] || 0) ? r : m));
  return { account: top.account, amount: top[key] };
};

export function InflowOutflowLines({
  rows,
  title = "Inflow vs. Outflow",
  currency = "USD",
}: { rows: Row[]; title?: string; currency?: string }) {
  // 1) aggregate by day (numbers only)
  const data = React.useMemo(() => {
    const by = new Map<string, { date: string; inflow: number; outflow: number }>();
    for (const r of rows) {
      const d = r.date.slice(0, 10);
      if (!by.has(d)) by.set(d, { date: d, inflow: 0, outflow: 0 });
      const v = by.get(d)!;
      v.inflow += Number(r.inflow) || 0;
      v.outflow += Number(r.outflow) || 0;
    }
    return [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  // guard dataset to avoid 0..0 domains
  const safe = data.length ? data : [{ date: "—", inflow: 0, outflow: 0 }];

  // totals
  const totals = React.useMemo(() => {
    const inflow = sum(safe.map(d => d.inflow));
    const outflow = sum(safe.map(d => d.outflow));
    return { inflow, outflow, net: inflow - outflow };
  }, [safe]);

  // legend isolate + modal
  const [modal, setModal] = React.useState<null | { side: "in" | "out"; account: string; amount: number }>(null);
  const [show, setShow] = React.useState<{ in: boolean; out: boolean }>({ in: true, out: true });
  const onLegendClick = (o: any) => {
    if (o?.value === "Inflows") {
      setShow({ in: true, out: false });
      const top = largestBy(rows, "inflow");
      setModal({ side: "in", account: top.account, amount: top.amount });
    } else if (o?.value === "Outflows") {
      setShow({ in: false, out: true });
      const top = largestBy(rows, "outflow");
      setModal({ side: "out", account: top.account, amount: top.amount });
    }
  };

  // compute Y domain: 0 .. max*1.1 (avoid squashed lines)
  const yMax = Math.max(
    ...safe.map(d => Math.max(d.inflow || 0, d.outflow || 0)),
    1 // avoid 0..0
  );
  const yDomain: [number, number] = [0, Math.ceil(yMax * 1.1)];

  // last-point badge
  const lastIdx = safe.length - 1;
  const BadgeDot = ({ cx, cy, index }: any) =>
    index === lastIdx ? (
      <>
        <circle cx={cx} cy={cy} r={8} fill="#c9fff7" opacity="0.25" />
        <circle cx={cx} cy={cy} r={5} fill="#a7fff1" stroke="black" strokeOpacity="0.15" />
      </>
    ) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        
      </div>

      {/* Give the container a real height. If this sits in a hidden tab, render once visible. */}
      <div className="h-[280px] w-full rounded-xl bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safe} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis domain={yDomain} allowDecimals={false}
                   tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
                     labelStyle={{ color: "white" }} itemStyle={{ color: "white" }}/>
            <Legend verticalAlign="top" align="right" onClick={onLegendClick}
                    wrapperStyle={{ color: "rgba(255,255,255,0.85)", fontSize: 12, cursor: "pointer" }}/>

            {show.in && (
              <>
                <Line name="Inflows" type="monotone" dataKey="inflow" stroke="#18A2B8"
                      strokeWidth={3.5} dot={<BadgeDot />} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="inflow" stroke="#18A2B8" strokeOpacity={0.22}
                      strokeWidth={9} dot={false} connectNulls />
              </>
            )}
            {show.out && (
              <>
                <Line name="Outflows" type="monotone" dataKey="outflow" stroke="#7C3AED"
                      strokeWidth={3.5} dot={<BadgeDot />} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="outflow" stroke="#7C3AED" strokeOpacity={0.22}
                      strokeWidth={9} dot={false} connectNulls />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      
      

      {/* Modal */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md bg-[#0c0c0c] border border-white/10">
          <DialogHeader><DialogTitle>{modal?.side === "in" ? "Largest Inflow" : "Largest Outflow"}</DialogTitle></DialogHeader>
          {modal && (
            <div className="mt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody><TableRow><TableCell className="font-mono">{modal.account}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt$(modal.amount, currency)}</TableCell></TableRow></TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
