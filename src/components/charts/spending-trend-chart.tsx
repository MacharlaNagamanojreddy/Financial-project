"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/finance";
import { formatCompactCurrency } from "@/lib/utils";

type SpendingTrendChartProps = {
  data: MonthlyTrendPoint[];
  currency: string;
};

export function SpendingTrendChart({
  data,
  currency,
}: SpendingTrendChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -24, right: 10, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="spendTrend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1f7a65" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1f7a65" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(185, 172, 156, 0.38)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6d7c88", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6d7c88", fontSize: 12 }}
            tickFormatter={(value) => formatCompactCurrency(Number(value), currency)}
          />
          <Tooltip
            formatter={(value) => formatCompactCurrency(Number(value ?? 0), currency)}
            contentStyle={{
              borderRadius: 20,
              border: "1px solid rgba(185, 172, 156, 0.46)",
              background: "rgba(255,255,255,0.96)",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#1f7a65"
            strokeWidth={3}
            fill="url(#spendTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
