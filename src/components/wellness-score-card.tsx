import type { WellnessSummary } from "@/lib/finance";
import { ProgressBar } from "./ui/progress-bar";

type WellnessScoreCardProps = {
  summary: WellnessSummary;
};

export function WellnessScoreCard({ summary }: WellnessScoreCardProps) {
  return (
    <div className="surface-card-strong p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Financial wellness score
            </p>
            <div className="flex items-end gap-4">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br ${summary.accentClass} text-white shadow-lg`}
              >
                <span className="text-3xl font-semibold">{summary.score}</span>
              </div>
              <div className="space-y-2 pb-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${summary.badgeClass}`}
                >
                  {summary.label}
                </span>
                <p className="max-w-sm text-sm leading-7 text-muted">
                  Built from your spending consistency, savings ratio, and goal progress.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {summary.suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm leading-7 text-slate-700"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          {summary.factors.map((factor) => (
            <div key={factor.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{factor.label}</p>
                  <p className="text-xs text-muted">{factor.description}</p>
                </div>
                <span className={`text-sm font-semibold ${summary.textClass}`}>
                  {factor.score}
                </span>
              </div>
              <ProgressBar
                value={factor.score}
                indicatorClassName={summary.progressClass}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
