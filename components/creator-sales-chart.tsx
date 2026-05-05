"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  netRevenue: number;
  commission: number;
};

export function CreatorSalesChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data yet. Add orders to see the chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
        <Tooltip
          formatter={(value, name) => [
            `€${Number(value).toFixed(2)}`,
            name === "netRevenue" ? "Net revenue" : "Commission",
          ]}
        />
        <Bar dataKey="netRevenue" name="netRevenue" fill="#cbc1b0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="commission" name="commission" fill="#a89a87" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
