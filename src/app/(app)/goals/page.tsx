import { addDays, formatISO } from "date-fns";
import { PiggyBank, Target } from "lucide-react";
import { GoalForm } from "@/components/forms/goal-form";
import { GoalContributionForm } from "@/components/forms/goal-contribution-form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics } from "@/lib/finance";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export default async function GoalsPage() {
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
        eyebrow="Save with intention"
        title="Savings goals"
        description="Create clear goals, monitor pacing toward each deadline, and add contributions whenever you move money toward them."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <PiggyBank className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted">Saved across goals</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(analytics.goalsSaved, analytics.currency)}
          </p>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
            <Target className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted">Total goal target</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(analytics.goalsTarget, analytics.currency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Goals on track</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {analytics.onTrackGoals}/{analytics.goalCount || 0}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Create a new goal</h2>
            <p className="text-sm text-muted">
              Add a name, target, and deadline. You can start with any amount already saved.
            </p>
          </div>
          <GoalForm
            defaultDeadline={formatISO(addDays(new Date(), 120), {
              representation: "date",
            })}
          />
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Active goals</h2>
            <p className="text-sm text-muted">
              Each card shows progress, target pacing, and a quick add-contribution form.
            </p>
          </div>

          {analytics.activeGoals.length ? (
            <div className="space-y-4">
              {analytics.activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-[26px] border border-line bg-white/70 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
                      <p className="text-sm text-muted">
                        Due {formatDate(goal.deadline)} • {goal.statusLabel}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-sm text-muted">Progress</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatPercent(goal.progress, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <ProgressBar value={goal.progress * 100} />
                    <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        {formatCurrency(Number(goal.current_amount), analytics.currency)} of{" "}
                        {formatCurrency(Number(goal.target_amount), analytics.currency)}
                      </span>
                      <span>
                        {goal.daysLeft >= 0 ? `${goal.daysLeft} days left` : "Past deadline"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <GoalContributionForm goalId={goal.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No goals yet"
              description="Start with one goal such as an emergency fund, travel plan, or a new device."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
