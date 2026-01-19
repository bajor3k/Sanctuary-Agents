
"use client"

import * as React from "react"
import { Pie, PieChart, Sector, Cell, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

const chartConfig = {
  value: {
    label: "Percentage",
  },
  "US Equities": { label: "US Equities" },
  "International Equities": { label: "International Equities" },
  "Fixed Income": { label: "Fixed Income" },
  "Alternatives": { label: "Alternatives" },
  "Cash & Equivalents": { label: "Cash & Equivalents" },
} satisfies ChartConfig

export function AssetAllocationDonutChart({ data }: { data: ChartDataItem[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%" aspect={1}>
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name, item) => [
                  `${item.payload.value}%`,
                  item.payload.label,
                ]}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="60%"
            outerRadius="95%"
            strokeWidth={2}
            stroke="hsl(var(--card))"
            activeIndex={activeIndex ?? undefined}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            activeShape={(props: any) => {
              const {
                cx,
                cy,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
              } = props;
              return (
                <g>
                  <text
                    x={cx}
                    y={cy! - 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="hsl(var(--foreground))"
                    className="text-sm"
                  >
                    {payload.label}
                  </text>
                  <text
                    x={cx}
                    y={cy! + 15}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={fill}
                    className="text-2xl font-bold"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius ? outerRadius + 8 : 0}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                  />
                </g>
              )
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
