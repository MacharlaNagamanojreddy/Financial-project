"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryBreakdownItem } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

type SpendingCategoryChartProps = {
  data: CategoryBreakdownItem[];
  currency: string;
};

export function SpendingCategoryChart({
  data,
  currency,
}: SpendingCategoryChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[24px] border border-dashed border-line bg-white/40 text-sm text-muted">
        Add a few expenses to unlock category insights.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.95fr]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={78}
              outerRadius={108}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((item) => (
                <Cell key={item.category} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0), currency)}
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(185, 172, 156, 0.46)",
                background: "rgba(255,255,255,0.96)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="text-sm font-medium text-slate-900">{item.category}</p>
                <p className="text-xs text-muted">
                  {Math.round(item.share * 100)}% of this month
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(item.amount, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
