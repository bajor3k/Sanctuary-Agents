
"use client"

import * as React from "react"
// This component will be removed from contribution-matrix/page.tsx
// but I'll keep its content for now in case it's used elsewhere or as a reference.
// If it's definitively not used, it can be deleted.
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, Legend, LabelList } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface RevenueOpportunityBarChartProps {
  data: {
    name: string; 
    opportunity: number;
    remainingContribution: number;
    accountType: string; 
  }[];
}

const accountTypeColors: Record<string, string> = {
  'Traditional IRA': "hsl(var(--chart-1))",
  'Roth IRA': "hsl(var(--chart-2))",
  'SEP IRA': "hsl(var(--chart-3))",
  'SIMPLE IRA': "hsl(var(--chart-4))",
  'Default': "hsl(var(--chart-5))",
};

export function RevenueOpportunityBarChart({ data }: RevenueOpportunityBarChartProps) {
  const chartConfig = {
    opportunity: {
      label: "Revenue Opportunity",
      color: "hsl(var(--chart-1))", 
    },
    "Traditional IRA": { label: "Traditional IRA", color: accountTypeColors['Traditional IRA'] },
    "Roth IRA": { label: "Roth IRA", color: accountTypeColors['Roth IRA'] },
    "SEP IRA": { label: "SEP IRA", color: accountTypeColors['SEP IRA'] },
    "SIMPLE IRA": { label: "SIMPLE IRA", color: accountTypeColors['SIMPLE IRA'] },
  } satisfies ChartConfig;

  const formattedData = data.map(item => ({
    ...item,
    label: chartConfig[item.accountType as keyof typeof chartConfig]?.label || item.accountType,
  }));


  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{
            top: 5,
            right: 50, 
            left: 20, 
            bottom: 20, 
          }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name" 
            type="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickMargin={5}
            axisLine={false}
            tickLine={false}
            width={100} 
            interval={0} 
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-2.5 shadow-sm text-sm">
                    <p className="font-medium text-foreground">{dataPoint.name}</p>
                    <p className="text-primary">
                      Opportunity: ${dataPoint.opportunity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                     <p className="text-xs text-muted-foreground">
                      Remaining Unfunded: ${dataPoint.remainingContribution.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ChartLegend content={<ChartLegendContent nameKey="name" />} verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: 10}} />
          <Bar dataKey="opportunity" radius={4} barSize={30}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={accountTypeColors[entry.accountType] || accountTypeColors['Default']} />
            ))}
             <LabelList
              dataKey="opportunity"
              position="right"
              offset={10}
              className="fill-foreground text-xs"
              formatter={(value: number) => `$${value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

