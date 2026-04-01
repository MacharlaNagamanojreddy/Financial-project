import { AlertCircle, Compass, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { WellnessScoreCard } from "@/components/wellness-score-card";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function InsightsPage() {
  const { user, profile } = await requireUser();
  const snapshot = await getFinanceSnapshot(user.id);
  const analytics = buildFinanceAnalytics(
    snapshot.profile ?? profile,
    snapshot.expenses,
    snapshot.goals,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="What the numbers are saying"
        description="Short, plain-language insights built from your actual expenses, savings ratio, and goal pacing."
      />

      <WellnessScoreCard summary={analytics.wellness} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">This period at a glance</h2>
            <p className="text-sm text-muted">
              The core numbers shaping your score and guidance right now.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Savings ratio</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatPercent(analytics.savingsRatio, 0)}
              </p>
            </div>
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Budget usage</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatPercent(analytics.budgetUsage, 0)}
              </p>
            </div>
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Month-to-date spend</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatCurrency(analytics.monthlySpending, analytics.currency)}
              </p>
            </div>
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Goal completion</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatPercent(analytics.goalProgress, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Weekly pulse</h2>
            <p className="text-sm text-muted">
              A quick comparison between this week and last week.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted">This week</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatCurrency(analytics.weeklyComparison.current, analytics.currency)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-line bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-sm text-muted">Last week</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatCurrency(analytics.weeklyComparison.previous, analytics.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Generated insights</h2>
          <p className="text-sm text-muted">
            These are refreshed from your latest expense and goal data.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {analytics.insights.map((insight) => (
            <div
              key={insight.title}
              className={`rounded-[26px] border p-5 ${
                insight.tone === "positive"
                  ? "border-emerald-200 bg-emerald-50/80"
                  : insight.tone === "watch"
                    ? "border-amber-200 bg-amber-50/80"
                    : "border-line bg-white/70"
              }`}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70">
                {insight.tone === "positive" ? (
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                ) : insight.tone === "watch" ? (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <Compass className="h-5 w-5 text-slate-700" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{insight.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">{insight.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
