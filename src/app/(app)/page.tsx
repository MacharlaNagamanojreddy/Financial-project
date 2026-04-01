import {
  ArrowDownRight,
  PiggyBank,
  ReceiptText,
  Target,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { SpendingCategoryChart } from "@/components/charts/spending-category-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { WellnessScoreCard } from "@/components/wellness-score-card";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics } from "@/lib/finance";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/utils";

export default async function DashboardPage() {
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
        eyebrow="Overview"
        title="Your personal finance cockpit"
        description="See where your money is going this month, how your goals are moving, and what your wellness score says about the current rhythm."
        actions={
          <>
            <Link
              href="/add-expense"
              className="inline-flex h-11 items-center justify-center rounded-full bg-teal-500 px-5 text-sm font-medium text-white transition hover:bg-teal-600"
            >
              Add expense
            </Link>
            <Link
              href="/goals"
              className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white/80 px-5 text-sm font-medium text-slate-900 transition hover:bg-white"
            >
              Create goal
            </Link>
          </>
        }
      />

      {snapshot.error ? (
        <Card className="border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-800">
          {snapshot.error} Run the SQL in <code>supabase/schema.sql</code>, then refresh the app.
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Current balance
              </p>
              <h2 className="text-5xl font-semibold tracking-tight text-slate-900">
                {formatCurrency(analytics.totalBalance, analytics.currency)}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted">
                This reflects your saved profile balance and automatically steps down when new expenses are added.
              </p>
            </div>

            <div className="rounded-[26px] border border-line bg-white/70 px-5 py-4">
              <p className="text-sm text-muted">This week vs last week</p>
              <div className="mt-2 flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-slate-700" />
                <span className="text-lg font-semibold text-slate-900">
                  {formatPercent(analytics.weeklyComparison.delta, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[26px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Monthly spend</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(analytics.monthlySpending, analytics.currency)}
              </p>
            </div>
            <div className="rounded-[26px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Monthly savings room</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(analytics.monthlySavings, analytics.currency)}
              </p>
            </div>
            <div className="rounded-[26px] border border-line bg-white/70 p-4">
              <p className="text-sm text-muted">Goals funded</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatPercent(analytics.goalProgress, 0)}
              </p>
            </div>
          </div>
        </Card>

        <WellnessScoreCard summary={analytics.wellness} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={formatCurrency(analytics.totalBalance, analytics.currency)}
          hint="Your live profile balance, reduced automatically by new expenses."
          icon={<Wallet2 className="h-5 w-5" />}
        />
        <StatCard
          label="Monthly spending"
          value={formatCurrency(analytics.monthlySpending, analytics.currency)}
          hint="Everything logged in the current calendar month."
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <StatCard
          label="Savings ratio"
          value={formatPercent(analytics.savingsRatio, 0)}
          hint="How much of this month's income remains available to save."
          icon={<PiggyBank className="h-5 w-5" />}
          tone="positive"
        />
        <StatCard
          label="Goals on track"
          value={`${analytics.onTrackGoals}/${analytics.goalCount || 0}`}
          hint="Savings goals that are meeting their expected pace."
          icon={<Target className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Spending trend</h3>
              <p className="text-sm text-muted">Your last six months of spending activity.</p>
            </div>
            <p className="text-sm font-medium text-slate-700">
              Peak month {formatCompactCurrency(Math.max(...analytics.monthlyTrend.map((item) => item.amount), 0), analytics.currency)}
            </p>
          </div>
          <SpendingTrendChart
            data={analytics.monthlyTrend}
            currency={analytics.currency}
          />
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900">
              This month by category
            </h3>
            <p className="text-sm text-muted">
              A quick view of where your spending is concentrated right now.
            </p>
          </div>
          <SpendingCategoryChart
            data={analytics.categoryBreakdown}
            currency={analytics.currency}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Recent transactions
              </h3>
              <p className="text-sm text-muted">
                Your latest logged expenses, sorted newest first.
              </p>
            </div>
            <Link href="/transactions" className="text-sm font-medium text-slate-700">
              View all
            </Link>
          </div>

          {analytics.recentTransactions.length ? (
            <div className="space-y-3">
              {analytics.recentTransactions.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-[24px] border border-line bg-white/70 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{expense.category}</p>
                    <p className="text-sm text-muted">
                      {expense.note || "No note"} • {formatDate(expense.date)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(Number(expense.amount), analytics.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to start building trends, insights, and a more accurate wellness score."
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Goal progress</h3>
              <p className="text-sm text-muted">
                The goals that are shaping your savings plan right now.
              </p>
            </div>
            <Link href="/goals" className="text-sm font-medium text-slate-700">
              Manage goals
            </Link>
          </div>

          {analytics.activeGoals.length ? (
            <div className="space-y-4">
              {analytics.activeGoals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-[24px] border border-line bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{goal.name}</p>
                      <p className="text-sm text-muted">
                        Due {formatDate(goal.deadline)} • {goal.statusLabel}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPercent(goal.progress, 0)}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <ProgressBar value={goal.progress * 100} />
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>
                        {formatCurrency(Number(goal.current_amount), analytics.currency)} saved
                      </span>
                      <span>
                        {formatCurrency(Number(goal.target_amount), analytics.currency)} target
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No savings goals yet"
              description="Create a goal to track progress toward an emergency fund, trip, or a major purchase."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
