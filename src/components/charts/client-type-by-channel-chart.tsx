
"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { channel: "Referral", hnw: 45, millennials: 30, genX: 20, retirees: 10 },
  { channel: "Website", hnw: 30, millennials: 55, genX: 25, retirees: 15 },
  { channel: "Event", hnw: 20, millennials: 25, genX: 35, retirees: 20 },
  { channel: "Social Media", hnw: 15, millennials: 40, genX: 30, retirees: 5 },
  { channel: "CPA", hnw: 35, millennials: 15, genX: 25, retirees: 12 },
];

const chartConfig = {
  clients: {
    label: "Number of Clients",
  },
  hnw: {
    label: "HNW",
    color: "hsl(var(--chart-1))", // Purple
  },
  millennials: {
    label: "Millennials",
    color: "hsl(var(--chart-2))", // Blue/Teal
  },
  genX: {
    label: "Gen X",
    color: "hsl(var(--chart-3))", // Green
  },
  retirees: {
    label: "Retirees",
    color: "hsl(var(--chart-orange))", // Orange
  },
} satisfies ChartConfig;

export function ClientTypeByChannelChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
          <XAxis
            dataKey="channel"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="hnw" fill="var(--color-hnw)" radius={4} />
          <Bar dataKey="millennials" fill="var(--color-millennials)" radius={4} />
          <Bar dataKey="genX" fill="var(--color-genX)" radius={4} />
          <Bar dataKey="retirees" fill="var(--color-retirees)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
