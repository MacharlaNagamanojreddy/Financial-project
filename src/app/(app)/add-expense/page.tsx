import { formatISO } from "date-fns";
import { ReceiptText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics } from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AddExpensePage() {
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
        eyebrow="Capture spending"
        title="Add a new expense"
        description="Log the amount, category, and date once. The dashboard, balance, and insights update from the same entry."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Expense details</h2>
            <p className="text-sm text-muted">
              Keep the note short and specific so your transaction history stays easy to scan.
            </p>
          </div>
          <ExpenseForm defaultDate={formatISO(new Date(), { representation: "date" })} />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-line bg-white/70 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted">Month-to-date spend</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {formatCurrency(analytics.monthlySpending, analytics.currency)}
                </p>
              </div>

              <div className="rounded-[26px] border border-line bg-white/70 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted">Current balance</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {formatCurrency(analytics.totalBalance, analytics.currency)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                Recent spending
              </h3>
              <p className="text-sm text-muted">
                Use this as a quick memory jog when you are adding new entries.
              </p>
            </div>

            {analytics.recentTransactions.length ? (
              <div className="space-y-3">
                {analytics.recentTransactions.slice(0, 6).map((expense) => (
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
                title="No expenses logged yet"
                description="Your most recent transactions will appear here once you add the first one."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
