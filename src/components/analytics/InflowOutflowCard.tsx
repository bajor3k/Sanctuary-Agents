
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
} from "recharts";

type Point = { label: string; inflow: number; outflow: number };

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const short = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : fmt.format(n);

// --- Sample data (swap with real series later) ---
const DATA_1M: Point[] = [
  { label: "03/01", inflow: 18000, outflow: 9000 },
  { label: "03/05", inflow: 22000, outflow: 8000 },
  { label: "03/09", inflow: 27000, outflow: 10000 },
  { label: "03/13", inflow: 24500, outflow: 12000 },
  { label: "03/17", inflow: 30000, outflow: 9500 },
  { label: "03/21", inflow: 33500, outflow: 15000 },
  { label: "03/25", inflow: 35000, outflow: 16000 },
  { label: "03/29", inflow: 36000, outflow: 17000 },
];
const DATA_QTD: Point[] = [
  { label: "Jan", inflow: 120000, outflow: 80000 },
  { label: "Feb", inflow: 150000, outflow: 90000 },
  { label: "Mar", inflow: 170000, outflow: 100000 },
];
const DATA_YTD: Point[] = [
  { label: "Jan", inflow: 120000, outflow: 80000 },
  { label: "Feb", inflow: 150000, outflow: 90000 },
  { label: "Mar", inflow: 170000, outflow: 100000 },
  { label: "Apr", inflow: 160000, outflow: 110000 },
  { label: "May", inflow: 175000, outflow: 120000 },
  { label: "Jun", inflow: 180000, outflow: 130000 },
];

function totals(rows: Point[]) {
  const totalIn = rows.reduce((s, r) => s + r.inflow, 0);
  const totalOut = rows.reduce((s, r) => s + r.outflow, 0);
  return { totalIn, totalOut, net: totalIn - totalOut };
}

export default function InflowOutflowCard() {
  const [range, setRange] = React.useState<"1M" | "QTD" | "YTD">("1M");
  const data = range === "QTD" ? DATA_QTD : range === "YTD" ? DATA_YTD : DATA_1M;
  const t = totals(data);

  // axis styling (subtle, no grid)
  const AXIS_TICK = "hsl(var(--muted-foreground))";
  const AXIS_LINE = "hsl(var(--border))";
  const INFLOW_COLOR = "hsl(var(--chart-3))";
  const OUTFLOW_COLOR = "hsl(var(--chart-5))";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Inflow v. Outflow</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as any)} className="w-auto">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="QTD">QTD</TabsTrigger>
            <TabsTrigger value="YTD">YTD</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4 pb-2">
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              {/* defs: gradient fills */}
              <defs>
                <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INFLOW_COLOR} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={INFLOW_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={OUTFLOW_COLOR} stopOpacity={0.20} />
                  <stop offset="100%" stopColor={OUTFLOW_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Clean axes (no grid) */}
              <XAxis
                dataKey="label"
                tick={{ fill: AXIS_TICK, fontSize: 12 }}
                tickMargin={8}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: AXIS_TICK, fontSize: 12 }}
                tickFormatter={short as any}
                width={56}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={false}
                domain={[0, "auto"]}
              />

              <Tooltip
                cursor={{ stroke: AXIS_LINE }}
                formatter={(v: number) => fmt.format(v)}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend wrapperStyle={{ color: AXIS_TICK }} />

              {/* Under-line soft gradients */}
              <Area
                type="monotone"
                dataKey="inflow"
                fill="url(#inflowFill)"
                stroke="none"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                fill="url(#outflowFill)"
                stroke="none"
                isAnimationActive={false}
              />

              {/* Crisp neon lines on top */}
              <Line
                type="monotone"
                dataKey="inflow"
                name="Inflows"
                stroke={INFLOW_COLOR}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="Outflows"
                stroke={OUTFLOW_COLOR}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Totals row (unchanged) */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-black border-none">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Total Inflows</div>
              <div className="text-lg font-semibold">{fmt.format(t.totalIn)}</div>
            </CardContent>
          </Card>
          <Card className="bg-black border-none">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Total Outflows</div>
              <div className="text-lg font-semibold">{fmt.format(t.totalOut)}</div>
            </CardContent>
          </Card>
          <Card className="bg-black border-none">
            <CardContent className="py-3">
              <div className="text-xs text-muted-foreground">Net Flow</div>
              <div className="text-foreground text-lg font-semibold">
                {fmt.format(t.net)}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
