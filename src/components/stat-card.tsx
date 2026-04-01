import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon?: ReactNode;
  tone?: "default" | "positive" | "warning";
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        {icon ? (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              tone === "positive" && "bg-emerald-100 text-emerald-700",
              tone === "warning" && "bg-amber-100 text-amber-700",
              tone === "default" && "bg-slate-900/5 text-slate-700",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-5 text-sm leading-6 text-muted">{hint}</p>
    </Card>
  );
}
