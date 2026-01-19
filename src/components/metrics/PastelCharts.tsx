
"use client";

import {
  ResponsiveContainer, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area
} from "recharts";

const demo = [
  { name: "Mon", value: 12, ratio: 0.18, cash: 32 },
  { name: "Tue", value: 19, ratio: 0.22, cash: 28 },
  { name: "Wed", value: 9,  ratio: 0.17, cash: 35 },
  { name: "Thu", value: 14, ratio: 0.20, cash: 31 },
  { name: "Fri", value: 11, ratio: 0.16, cash: 29 },
];

export function BarBlock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={demo}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip cursor={false} />
          <Bar dataKey="value" radius={[6,6,0,0]} fill={"hsl(var(--chart-1))"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineBlock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={demo}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="ratio" stroke={"hsl(var(--chart-6))"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaBlock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 chart-card">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={demo}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="cash"
            stroke={"hsl(var(--chart-3))"}
            fill={"hsl(var(--chart-3))"}
            fillOpacity={0.18}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
