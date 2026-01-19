// src/components/charts/MonteCarloChart.tsx
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

export interface MonteCarloChartDataPoint {
  year: number;
  p05: number; // 5th percentile
  p25: number; // 25th percentile
  median: number; // 50th percentile
  p75: number; // 75th percentile
  p95: number; // 95th percentile
}

interface MonteCarloChartProps {
  data: MonteCarloChartDataPoint[];
}

const chartConfig = {
  portfolioValue: {
    label: "Portfolio Value",
  },
  median: {
    label: "Median",
    color: "hsl(var(--primary))",
  },
  p25_p75: {
    label: "25th-75th Percentile",
    color: "hsl(var(--primary) / 0.3)",
  },
  p05_p95: {
    label: "5th-95th Percentile",
    color: "hsl(var(--primary) / 0.15)",
  },
} satisfies ChartConfig;

export function MonteCarloChart({ data }: MonteCarloChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No simulation data available.</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full" id="monte-carlo-chart-container">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `Year ${value}`}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          stroke="hsl(var(--muted-foreground))"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(label, payload) => `Year ${label}`}
              formatter={(value, name, props) => {
                const formattedValue = typeof value === 'number' 
                  ? `$${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`
                  : 'N/A';
                
                let displayName = props.name;
                if (name === 'median') displayName = 'Median';
                else if (name === 'p05_p95') displayName = '5th-95th Percentile Range';
                else if (name === 'p25_p75') displayName = '25th-75th Percentile Range';

                // For area ranges, display both values if possible
                if (name === 'p05_p95' && props.payload) {
                  const p05 = props.payload.p05;
                  const p95 = props.payload.p95;
                  return `$${p05.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} – $${p95.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
                }
                if (name === 'p25_p75' && props.payload) {
                  const p25 = props.payload.p25;
                  const p75 = props.payload.p75;
                   return `$${p25.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} – $${p75.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
                }

                return formattedValue;
              }}
            />
          }
        />
        <Area
          dataKey="p95" // Used as the upper bound for the lighter band
          type="monotone"
          fill="var(--color-p05_p95)"
          fillOpacity={0.8} // ensure this is visible
          stroke="transparent"
          stackId="percentiles"
          activeDot={false}
          name="p05_p95"
          yAxisId={0}
        />
         <Area
          dataKey="p05" // This will "cut out" from the p95 area. We define p05 as the "top" of this area.
          type="monotone"
          fill="hsl(var(--background))" // Fill with background to create the band effect
          stroke="transparent"
          stackId="percentiles" // Must match the one above
          activeDot={false}
          name="p05_p95" // This is just for the tooltip content, not for direct rendering
          yAxisId={0}
        />
         <Area
          dataKey="p75" 
          type="monotone"
          fill="var(--color-p25_p75)"
          fillOpacity={0.9}
          stroke="transparent"
          stackId="percentilesInner"
          activeDot={false}
          name="p25_p75"
          yAxisId={0}
        />
        <Area
          dataKey="p25"
          type="monotone"
          fill="hsl(var(--background))" 
          stroke="transparent"
          stackId="percentilesInner"
          activeDot={false}
          name="p25_p75"
          yAxisId={0}
        />
        <Line
          dataKey="median"
          type="monotone"
          stroke="var(--color-median)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-median)", strokeWidth: 0 }}
          name="median"
          yAxisId={0}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
