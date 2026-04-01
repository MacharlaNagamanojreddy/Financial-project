import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function ProgressBar({
  value,
  className,
  indicatorClassName,
}: ProgressBarProps) {
  return (
    <div className={cn("h-3 w-full rounded-full bg-slate-200/70", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-accent to-teal-400 transition-all duration-500",
          indicatorClassName,
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
