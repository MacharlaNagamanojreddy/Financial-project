import { BadgeDollarSign, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/forms/profile-form";
import { SignOutButton } from "@/components/forms/sign-out-button";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  const snapshot = await getFinanceSnapshot(user.id);
  const resolvedProfile = snapshot.profile ?? profile;
  const analytics = buildFinanceAnalytics(
    resolvedProfile,
    snapshot.expenses,
    snapshot.goals,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Account and finance settings"
        description="Update the profile values that power your balance, savings ratio, and personal finance insights."
        actions={<SignOutButton />}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Profile details</h2>
            <p className="text-sm text-muted">
              Income, budget, and balance feed directly into dashboard summaries and the wellness score.
            </p>
          </div>
          <ProfileForm profile={resolvedProfile} email={user.email ?? ""} />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <BadgeDollarSign className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted">Current balance</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {formatCurrency(analytics.totalBalance, analytics.currency)}
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted">Wellness score</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {analytics.wellness.score}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Account snapshot</h2>
              <p className="text-sm text-muted">
                A quick overview of what your profile settings currently imply.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[24px] border border-line bg-white/70 px-4 py-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-slate-700" />
                  <span className="text-sm text-slate-700">Email</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-[24px] border border-line bg-white/70 px-4 py-4">
                <span className="text-sm text-slate-700">Monthly income</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(analytics.monthlyIncome, analytics.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[24px] border border-line bg-white/70 px-4 py-4">
                <span className="text-sm text-slate-700">Monthly budget</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(analytics.monthlyBudget, analytics.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[24px] border border-line bg-white/70 px-4 py-4">
                <span className="text-sm text-slate-700">Savings ratio</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatPercent(analytics.savingsRatio, 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
