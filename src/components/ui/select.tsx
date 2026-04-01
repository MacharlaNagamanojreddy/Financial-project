import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10",
        className,
      )}
      {...props}
    />
  );
}
