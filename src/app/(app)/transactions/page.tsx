import { Filter, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { getFinanceSnapshot } from "@/lib/data";
import { buildFinanceAnalytics, filterExpenses } from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/utils";

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const { user, profile } = await requireUser();
  const [snapshot, query] = await Promise.all([
    getFinanceSnapshot(user.id),
    searchParams,
  ]);
  const analytics = buildFinanceAnalytics(
    snapshot.profile ?? profile,
    snapshot.expenses,
    snapshot.goals,
  );

  const filters = {
    category: getQueryValue(query.category) ?? "All",
    from: getQueryValue(query.from) ?? "",
    to: getQueryValue(query.to) ?? "",
  };

  const filteredExpenses = filterExpenses(snapshot.expenses, filters);
  const filteredTotal = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Transaction history"
        description="Filter your expenses by category or date range to review specific spending patterns and totals."
      />

      <Card className="p-6">
        <form className="grid gap-4 lg:grid-cols-[1.1fr,1fr,1fr,auto]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <Select name="category" defaultValue={filters.category}>
              <option value="All">All categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">From</span>
            <Input name="from" type="date" defaultValue={filters.from} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">To</span>
            <Input name="to" type="date" defaultValue={filters.to} />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-teal-500 px-5 text-sm font-medium text-white transition hover:bg-teal-600"
            >
              <Filter className="h-4 w-4" />
              Apply filters
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted">Filtered transactions</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {filteredExpenses.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Filtered total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(filteredTotal, analytics.currency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Average per expense</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(
              filteredExpenses.length ? filteredTotal / filteredExpenses.length : 0,
              analytics.currency,
            )}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
          <p className="text-sm text-muted">
            Every expense entry is shown here with the date, category, note, and amount.
          </p>
        </div>

        {filteredExpenses.length ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="grid gap-3 rounded-[24px] border border-line bg-white/70 px-4 py-4 md:grid-cols-[1.2fr,0.9fr,0.9fr,auto] md:items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">{expense.note || expense.category}</p>
                  <p className="text-sm text-muted">{expense.category}</p>
                </div>
                <p className="text-sm text-slate-700">{formatDate(expense.date)}</p>
                <p className="text-sm text-muted">{expense.note || "No note"}</p>
                <p className="text-sm font-semibold text-slate-900 md:text-right">
                  {formatCurrency(Number(expense.amount), analytics.currency)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No transactions match those filters"
            description="Adjust the category or date range, or log a new expense to see activity here."
            icon={<ReceiptText className="h-6 w-6" />}
          />
        )}
      </Card>
    </div>
  );
}
