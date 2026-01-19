
'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CardHeader, CardTitle } from '@/components/ui/card';
dayjs.extend(isoWeek);

type FlowRow = { date: string; inflow: number; outflow: number };

type Timeframe = 'MTD' | 'LAST_30D' | 'QTD' | 'YTD';

interface FlowsDivergingCardProps {
  title?: string;
  data: FlowRow[]; // unsummarized daily rows are fine
  initialTimeframe?: Timeframe;
  className?: string;
}

const TF_LABELS: Record<Timeframe, string> = {
  MTD: 'MTD',
  LAST_30D: 'Last 30D',
  QTD: 'QTD',
  YTD: 'YTD',
};

function startOfTimeframe(tf: Timeframe) {
  const now = dayjs();
  if (tf === 'MTD') return now.startOf('month');
  if (tf === 'LAST_30D') return now.subtract(29, 'day').startOf('day');
  if (tf === 'QTD') {
    const q = Math.floor(now.month() / 3); // 0..3
    return dayjs(new Date(now.year(), q * 3, 1));
  }
  return now.startOf('year'); // YTD
}

function formatCurrency(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? '-' : ''}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${n < 0 ? '-' : ''}${(abs / 1_000).toFixed(0)}K`;
  return `${n < 0 ? '-' : ''}$${abs.toFixed(0)}`;
}

function summarize(data: FlowRow[]) {
  const totalIn = data.reduce((a, r) => a + (r.inflow || 0), 0);
  const totalOut = data.reduce((a, r) => a + (r.outflow || 0), 0);
  const net = totalIn - totalOut;
  return { totalIn, totalOut, net };
}

const chipBase =
  'px-3 h-8 inline-flex items-center rounded-full text-sm transition border border-[color:var(--nav-divider,rgba(255,255,255,.12))]';
const chipMuted = `${chipBase} text-[rgba(255,255,255,.55)]`;
const chipActive = `${chipBase} text-[rgba(255,255,255,.90)] bg-[rgba(255,255,255,.06)]`;

const cardBase =
  'rounded-2xl border border-[color:var(--nav-border,rgba(255,255,255,.12))] bg-[hsl(var(--card))] p-4 sm:p-5';

const legendDot = (c: string) =>
  `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:.5rem"></span>`;

export default function FlowsDivergingCard({
  title = 'Inflows vs Outflows',
  data,
  initialTimeframe = 'MTD',
  className,
}: FlowsDivergingCardProps) {
  const [tf, setTf] = React.useState<Timeframe>(initialTimeframe);

  // Filter to timeframe
  const start = startOfTimeframe(tf);
  const filtered = React.useMemo(
    () => data.filter((r) => dayjs(r.date).isAfter(start.subtract(1, 'day'))),
    [data, start]
  );

  // Normalize for chart: outflow as negative for diverging bars
  const chartData = React.useMemo(
    () =>
      filtered
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
        .map((r) => ({
          date: dayjs(r.date).format('MM/DD'),
          inflow: r.inflow || 0,
          outflow: (r.outflow || 0) * -1,
          net: (r.inflow || 0) - (r.outflow || 0),
        })),
    [filtered]
  );

  const sums = React.useMemo(() => summarize(filtered), [filtered]);

  // Palette: uses your tokens
  const inflowColor = 'var(--palette-1)'; // Baby Blue Eyes
  const outflowColor = 'var(--palette-6)'; // Mauve
  const netLineColor = 'var(--palette-2)'; // Diamond

  return (
    <section className={`${cardBase} ${className || ''}`}>
      {/* Header */}
      <CardHeader className="p-0 mb-3">
        <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-bold">{title}</CardTitle>
            <div className="flex items-center gap-2">
            {(Object.keys(TF_LABELS) as Timeframe[]).map((k) => (
                <button
                key={k}
                onClick={() => setTf(k)}
                className={tf === k ? chipActive : chipMuted}
                aria-pressed={tf === k}
                >
                {TF_LABELS[k]}
                </button>
            ))}
            </div>
        </div>
      </CardHeader>

      {/* Chart */}
      <div className="h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,.12)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,.65)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,.12)' }}
              tickLine={{ stroke: 'rgba(255,255,255,.12)' }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fill: 'rgba(255,255,255,.65)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,.12)' }}
              tickLine={{ stroke: 'rgba(255,255,255,.12)' }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,.25)" />
            <Tooltip
              contentStyle={{
                background: 'rgba(20,20,20,.95)',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 12,
              }}
              formatter={(val: any, name: any) => [formatCurrency(val as number), name]}
              labelStyle={{ color: 'rgba(255,255,255,.8)' }}
            />
            {/* Outflows left of zero (negative) */}
            <Bar dataKey="outflow" name="Outflows" fill={outflowColor} />
            {/* Inflows right of zero */}
            <Bar dataKey="inflow" name="Inflows" fill={inflowColor} />
            {/* Net line (just for tooltip clarity; not visible if not used) */}
            {/* You can add a Line component if you'd like a visible net overlay */}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / KPI summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <div
          className="mr-4 text-[rgba(255,255,255,.75)]"
          dangerouslySetInnerHTML={{
            __html:
              legendDot(inflowColor) +
              '<span>Inflows</span> &nbsp;&nbsp;' +
              legendDot(outflowColor) +
              '<span>Outflows</span>',
          }}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className={`${chipBase} text-[rgba(255,255,255,.75)]`}>
            In: <span className="ml-2 font-semibold text-[color:var(--palette-1)]">{formatCurrency(sums.totalIn)}</span>
          </span>
          <span className={`${chipBase} text-[rgba(255,255,255,.75)]`}>
            Out:{' '}
            <span className="ml-2 font-semibold" style={{ color: outflowColor }}>
              {formatCurrency(sums.totalOut)}
            </span>
          </span>
          <span className={`${chipBase} text-[rgba(255,255,255,.85)]`}>
            Net:{' '}
            <span
              className="ml-2 font-semibold"
              style={{ color: sums.net >= 0 ? 'var(--palette-2)' : 'var(--palette-6)' }}
            >
              {formatCurrency(sums.net)}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
